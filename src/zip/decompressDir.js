import fs from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import path from "path";
import { createBrotliDecompress } from "zlib";

const decompressDir = async () => {
  const compressedDir = path.resolve("./workspace/compressed");
  const archivePath = path.join(compressedDir, "archive.br");
  const targetDir = path.resolve("./workspace/decompressed");

  try {
    const stat = await fs.stat(archivePath);
    if (!stat.isFile()) throw new Error("FS operation failed");
  } catch {
    throw new Error("FS operation failed");
  }

  await fs.mkdir(targetDir, { recursive: true });

  const reader = createReadStream(archivePath).pipe(createBrotliDecompress());

  let buffer = Buffer.alloc(0);
  let currentFile = null;

  for await (const chunk of reader) {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length > 0) {
      if (!currentFile) {
        const newlineIndex = buffer.indexOf(0x0a);
        if (newlineIndex === -1) break;

        const line = buffer.slice(0, newlineIndex).toString("utf8");
        buffer = buffer.slice(newlineIndex + 1);

        const [entryType, relativePath, sizeRaw] = line.split("\t");

        if (entryType === "D") {
          await fs.mkdir(path.join(targetDir, relativePath), {
            recursive: true,
          });
        } else if (entryType === "F") {
          const size = parseInt(sizeRaw, 10);
          const filePath = path.join(targetDir, relativePath);
          await fs.mkdir(path.dirname(filePath), { recursive: true });

          currentFile = {
            remaining: size,
            stream: createWriteStream(filePath),
          };
        }
        continue;
      }

      const bytesToWrite = Math.min(currentFile.remaining, buffer.length);
      currentFile.stream.write(buffer.subarray(0, bytesToWrite));
      buffer = buffer.subarray(bytesToWrite);
      currentFile.remaining -= bytesToWrite;

      if (currentFile.remaining === 0) {
        if (buffer[0] === 0x0a) {
          buffer = buffer.subarray(1);
        }
        currentFile.stream.end();
        currentFile = null;
      }
    }
  }
};

await decompressDir();
