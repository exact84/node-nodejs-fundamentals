const dynamic = async () => {
  const pluginName = process.argv[2];
  try {
    const plugin = await import(`./plugins/${pluginName}.js`);
    const result = await plugin.run();
    console.log(result);
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND") {
      console.log("Plugin not found");
      process.exit(1);
    } else {
      throw error;
    }
  }
};

await dynamic();
