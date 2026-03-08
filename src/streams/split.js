import { createReadStream } from "fs";
import fs from "fs/promises";

const split = async () => {
  const maxLinesIndex = process.argv.indexOf("--lines");
  const maxLines =
    maxLinesIndex !== -1 ? Number(process.argv[maxLinesIndex + 1]) || 10 : 10;

  await fs.access("source.txt");

  const stream = createReadStream("source.txt");

  let buffer = [];
  let fileNumber = 1;
  let leftover = "";
  for await (const chunk of stream) {
    leftover += chunk.toString();
    const lines = leftover.split(/\r?\n/);
    leftover = lines.pop() || "";

    for (const line of lines) {
      buffer.push(line);

      if (buffer.length === maxLines) {
        await fs.writeFile(`chunk_${fileNumber}.txt`, buffer.join("\n"));
        buffer = [];
        fileNumber += 1;
      }
    }

    if (leftover) {
      buffer.push(leftover);
    }

    if (buffer.length > 0) {
      await fs.writeFile(`chunk_${fileNumber}.txt`, buffer.join("\n"));
    }
  }
  await fs.writeFile(`chunk_${fileNumber}.txt`, buffer.join("\n"));
};

await split();
