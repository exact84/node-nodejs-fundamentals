import fs from "fs/promises";
import path from "path";

const merge = async () => {
  const rootFolder = "./workspace/parts";
  const argsIndex = process.argv.indexOf("--files");
  let parts = [];
  let result = "";

  try {
    if (argsIndex !== -1) {
      parts = process.argv[argsIndex + 1].split(",") ?? [];
    } else {
      parts = await fs.readdir(rootFolder, { withFileTypes: true });
      parts = parts
        .filter((part) => part.isFile() && path.extname(part.name) === ".txt")
        .map((part) => part.name)
        .sort((a, b) => a.localeCompare(b));
    }

    for (const part of parts) {
      const file = await fs.readFile(path.join(rootFolder, part), "utf8");
      result += file;
    }
  } catch (error) {
    throw new Error("FS operation failed");
  }

  await fs.writeFile("./workspace/merged.txt", result, "utf8");
};

await merge();
