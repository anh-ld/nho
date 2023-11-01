import { resolve } from "path";
import { transform } from "esbuild";
import { defineConfig } from "vite";
import packageContent from "./package.json";

function minifyEs() {
  return {
    renderChunk: {
      order: "post",
      async handler(code, chunk, outputOptions) {
        if (outputOptions.format === "es")
          return await transform(code, { minify: true });
        return code;
      },
    },
  };
}

export default defineConfig(({ command, mode }) => {
  let config = {
    plugins: [minifyEs()],
    resolve: { alias: { "@": resolve(__dirname, "./src") } },
    build: { emptyOutDir: true },
  };

  if (command === "serve" || (command === "build" && mode === "example")) {
    config.root = resolve(__dirname, "./playground");
  } else if (command === "build" && mode === "lib") {
    config.root = resolve(__dirname, "./");
    config.build.lib = {
      entry: resolve(__dirname, "./src/index.js"),
      formats: ["es", "umd"],
      name: packageContent.name,
      fileName: (format) => `index.${format}.js`,
    };
  }

  return config;
});
