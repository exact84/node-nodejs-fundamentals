import fs from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { createBrotliCompress } from "zlib";

const compressDir = async () => {
  const sourceDir = path.resolve("./workspace/toCompress");
  const compressedDir = path.resolve("./workspace/compressed");
  const archivePath = path.join(compressedDir, "archive.br");

  async function checkPath(dirPath, writeStream) {
    const dirents = await fs.readdir(dirPath, { withFileTypes: true });

    for (const dirent of dirents) {
      const absolutePath = path.join(dirPath, dirent.name);
      const relativePath = path
        .relative(sourceDir, absolutePath)
        .replace(/\\/g, "/");

      if (dirent.isDirectory()) {
        writeStream.write(`D\t${relativePath}\n`);
        await checkPath(absolutePath, writeStream);
      } else if (dirent.isFile()) {
        const stat = await fs.stat(absolutePath);
        writeStream.write(`F\t${relativePath}\t${stat.size}\n`);

        const fileReadStream = createReadStream(absolutePath);
        for await (const chunk of fileReadStream) {
          writeStream.write(chunk);
        }
        writeStream.write("\n");
      }
    }
  }

  try {
    const stat = await fs.stat(sourceDir);
    if (!stat.isDirectory()) throw new Error("FS operation failed");

    await fs.mkdir(compressedDir, { recursive: true });

    const compressor = createBrotliCompress();
    const archiveWriteStream = createWriteStream(archivePath);

    const pipelinePromise = pipeline(compressor, archiveWriteStream);

    await checkPath(sourceDir, compressor);
    compressor.end();

    await pipelinePromise;
  } catch {
    throw new Error("FS operation failed");
  }
};

await compressDir();
