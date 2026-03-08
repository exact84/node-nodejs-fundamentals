import fs from "fs/promises";
import path from "path";

const snapshot = async () => {
  const entries = [];
  const rootPath = path.resolve("./workspace").replace(/\\/g, "/");

  async function checkPath(currentPath) {
    try {
      const folder = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of folder) {
        const relativePath = path
          .relative("./workspace", path.join(currentPath, entry.name))
          .replace(/\\/g, "/");
        if (entry.isFile()) {
          const file = await fs.readFile(
            `${currentPath}/${entry.name}`,
            "base64",
          );

          entries.push({
            path: path
              .relative("./workspace", path.join(currentPath, entry.name))
              .replace(/\\/g, "/"),
            type: "file",
            size: Buffer.byteLength(file, "base64"),
            content: file,
          });
        } else if (entry.isDirectory()) {
          entries.push({ path: relativePath, type: "directory" });
          await checkPath(path.join(currentPath, entry.name));
        }
      }
    } catch (error) {
      throw new Error("FS operation failed");
    }
  }

  await checkPath("./workspace");
  await fs.writeFile(
    "./snapshot.json",
    JSON.stringify({
      rootPath,
      entries,
    }),
  );
};

await snapshot();
