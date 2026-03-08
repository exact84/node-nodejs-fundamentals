import { spawn } from "child_process";

const execCommand = () => {
  const command = process.argv.slice(2).join(" ").trim();
  if (!command) return;

  const child = spawn(command, {
    shell: true,
    env: process.env,
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on("error", (err) => {
    console.error("Failed to start process:", err);
    process.exit(1);
  });

  child.on("close", (code) => {
    process.exit(code ?? 0);
  });
};

execCommand();
