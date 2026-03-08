import fs from "fs/promises";
import { createReadStream } from "fs";
import { createHash } from "crypto";
import path from "path";

const verify = async () => {
  let data;
  const rootPath = path.resolve("./workspace");

  try {
    data = JSON.parse(await fs.readFile("./checksums.json", "utf-8"));
  } catch (error) {
    throw new Error("FS operation failed");
  }

  for (const [fileName, expectedHash] of Object.entries(data)) {
    try {
      const filePath = path.join(rootPath, fileName);
      await fs.access(filePath);

      const stream = createReadStream(filePath);
      const hash = createHash("sha256");

      for await (const chunk of stream) {
        hash.update(chunk);
      }
      const actualHash = hash.digest("hex");

      const status = actualHash === expectedHash ? "OK" : "FAIL";
      console.log(`${fileName} — ${status}`);
    } catch (err) {
      console.log(`${fileName} — FAIL`);
    }
  }
};

await verify();
