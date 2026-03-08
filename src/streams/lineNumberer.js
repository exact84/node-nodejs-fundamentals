import { Transform } from "stream";

const lineNumberer = () => {
  // Usage examples in Windows environment:
  // - "streams:lineNumberer": "(echo hello & echo world) | node src/streams/lineNumberer.js"
  // - "streams:lineNumberer": "node -e \"process.stdout.write('hello\\nworld\\ntest')\" | node src/streams/lineNumberer.js"
  // - "streams:lineNumberer": "node src/streams/lineNumberer.js < test-line-numberer.txt"

  // 1. If the input comes from command-line parameters, the stream closes after processing them.
  // 2. The '\n' characters in interactive mode are not treated as line separators, they might just be part of the text.
  // 3. Empty lines are counted and numbered.

  let lineNumber = 1;
  let leftover = "";

  const lineNumberer = new Transform({
    transform(chunk, encoding, callback) {
      leftover = leftover + chunk.toString();
      const lines = leftover.split(/\r?\n/);
      leftover = lines.pop();

      const numbered = lines
        .map((line) => `${lineNumber++} | ${line}`)
        .join("\n");

      callback(null, numbered.length ? numbered + "\n" : "");
    },
    flush(callback) {
      if (leftover) {
        callback(null, `${lineNumber++} | ${leftover}\n`);
      } else {
        callback();
      }
    },
  });

  process.stdin.pipe(lineNumberer).pipe(process.stdout);
};

lineNumberer();
