import { Transform } from "stream";

const filter = () => {
  // Usage examples in Windows environment:
  // - "streams:filter": "(echo hellotest123 & echo world & echo test) | node src/streams/filter.js"
  // - "streams:filter": "node -e \"process.stdout.write('hellotest123\\nworld\\ntest')\" | node src/streams/filter.js --pattern test"
  // - "streams:filter": "node src/streams/filter.js --pattern test < test-line-numberer.txt"

  const patternIndex = process.argv.indexOf("--pattern");
  const pattern =
    patternIndex !== -1 ? process.argv[patternIndex + 1] || "" : "";

  let leftover = "";

  const filter = new Transform({
    transform(chunk, encoding, callback) {
      leftover = leftover + chunk.toString();
      const lines = leftover.split(/\r?\n/);
      leftover = lines.pop();

      let output = "";
      for (const line of lines) {
        if (line.includes(pattern)) {
          output += line + "\n";
        }
      }

      callback(null, output);
    },
    flush(callback) {
      if (leftover.includes(pattern)) {
        callback(null, leftover + "\n");
      } else {
        callback();
      }
    },
  });

  process.stdin.pipe(filter).pipe(process.stdout);
};

filter();
