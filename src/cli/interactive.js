import readline from "readline";

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  process.on("SIGINT", () => {
    console.log("Goodbye!");
    process.exit();
  });

  rl.on("close", () => {
    console.log("Goodbye!");
    process.exit();
  });

  rl.prompt();

  rl.on("line", (comand) => {
    switch (comand) {
      case "uptime": {
        console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
        break;
      }
      case "cwd": {
        console.log(process.cwd());
        break;
      }
      case "date": {
        console.log(new Date().toISOString());
        break;
      }
      case "exit": {
        console.log("Goodbye!");
        process.exit();
      }
      default: {
        console.log("Unknown command");
        break;
      }
    }
    rl.prompt();
  });
};

interactive();
