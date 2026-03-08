const progress = () => {
  const params = process.argv.slice(2);

  const duration =
    params.indexOf("--duration") !== -1 ?
      Number(params[params.indexOf("--duration") + 1])
    : 5000;
  const interval =
    params.indexOf("--interval") !== -1 ?
      Number(params[params.indexOf("--interval") + 1])
    : 100;
  const length =
    params.indexOf("--length") !== -1 ?
      Number(params[params.indexOf("--length") + 1])
    : 30;
  const color = params[params.indexOf("--color") + 1];

  const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, "");
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return null;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  };

  const rgb = hexToRgb(color);

  let currentTime = 0;
  const timer = setInterval(() => {
    currentTime += interval;

    if (currentTime >= duration) {
      clearInterval(timer);
      const filled = "█".repeat(length);
      const bar =
        rgb ? `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${filled}\x1b[0m` : filled;
      process.stdout.write(`\r[${bar}] 100%`);
      console.log("\nDone!");
      return;
    }

    const filledLength = Math.min(
      length,
      Math.floor((currentTime / duration) * length),
    );
    const remainingLength = length - filledLength;

    const filled = "█".repeat(filledLength);
    const remaining = " ".repeat(remainingLength);

    let bar =
      rgb ?
        `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${filled}\x1b[0m${remaining}`
      : filled + remaining;

    const percent = Math.round((currentTime / duration) * 100);
    process.stdout.write(`\r[${bar}] ${percent}%`);
  }, interval);
};

progress();
