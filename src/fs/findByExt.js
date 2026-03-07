import fs from "fs/promises";
import path from "path";

const findByExt = async () => {
  async function checkPath(currentPath) {
    try {
      const folder = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of folder) {
        const relativePath = path
          .relative("./workspace", path.join(currentPath, entry.name))
          .replace(/\\/g, "/");
        if (entry.isFile()) {
          files.push(relativePath);
        } else {
          await checkPath(path.join(currentPath, entry.name));
        }
      }
    } catch (error) {
      throw new Error("FS operation failed");
    }
  }

  const files = [];
  const rootFolder = "./workspace";
  const extIndex = process.argv.indexOf("--ext");
  const ext = extIndex !== -1 ? process.argv[extIndex + 1] : "txt";

  await checkPath(rootFolder);

  const filteredFiles = files.filter(
    (file) => path.extname(file).slice(1) === ext,
  );

  const sortedFiles = filteredFiles.sort((a, b) => a.localeCompare(b));

  for (const file of sortedFiles) console.log(file);
};

await findByExt();
