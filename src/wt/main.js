import os from "os";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import { Worker } from "worker_threads";

const main = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  let data;
  const N = os.cpus().length;

  try {
    data = JSON.parse(await fs.readFile("./data.json", "utf-8"));
  } catch (error) {
    throw new Error("FS operation failed");
  }

  const chunkSize = Math.ceil(data.length / N);
  const chunks = [];
  for (let i = 0; i < N; i++) {
    chunks.push(data.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  const promises = chunks.map((chunk) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, "worker.js"));
      worker.on("message", (answer) => {
        resolve(answer);
        worker.terminate();
      });

      worker.on("error", (err) => {
        reject(err);
        worker.terminate();
      });
      worker.postMessage(chunk);
    });
  });

  const sortedChunks = await Promise.all(promises);

  const sorted = kWayMerge(sortedChunks);
  console.log("Final sorted array:", sorted);

  function kWayMerge(chunks) {
    const result = [];

    const indices = new Array(chunks.length).fill(0);

    while (true) {
      let minVal = Infinity;
      let minChunk = -1;

      for (let i = 0; i < chunks.length; i++) {
        const idx = indices[i];
        if (idx < chunks[i].length) {
          const val = chunks[i][idx];
          if (val < minVal) {
            minVal = val;
            minChunk = i;
          }
        }
      }

      if (minChunk === -1) break;
      result.push(minVal);
      indices[minChunk]++;
    }

    return result;
  }
};

await main();
