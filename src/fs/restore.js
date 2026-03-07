import fs from "fs/promises";
import path from "path";

const restore = async () => {
  try {
    await fs.access("./snapshot.json", fs.constants.F_OK);
  } catch (error) {
    throw new Error("FS operation failed");
  }

  try {
    await fs.access("./workspace_restored");
    throw new Error("FS operation failed");
  } catch (error) {
    if (error.message === "FS operation failed") {
      throw error;
    }
    await fs.mkdir("./workspace_restored");
  }

  const snapshot = JSON.parse(await fs.readFile("./snapshot.json", "utf-8"));

  for (const file of snapshot.entries) {
    if (file.type === "directory") {
      await fs.mkdir(path.join("./workspace_restored", file.path), {
        recursive: true,
      });
    } else {
      await fs.writeFile(
        path.join("./workspace_restored", file.path),
        file.content,
        "base64",
      );
    }
  }
};

await restore();
