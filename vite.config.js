import { resolve } from "node:path";
import { transform } from "esbuild";
import { defineConfig } from "vite";
import { name } from "./package.json";

// minify plugin, based on esbuild's native method
const minifyEs = {
  renderChunk: {
    order: "post",
    async handler(code, _, { format }) {
      if (format === "es") return await transform(code, { minify: true });

      return code;
    },
  },
};

// paths
const srcPath = resolve(__dirname, "./src");
const examplePath = resolve(__dirname, "./example");
const rootPath = resolve(__dirname, "./");

// config
export default defineConfig(({ command, mode }) => {
  const config = {
    plugins: [minifyEs],
    resolve: {
      alias: {
        "@": srcPath,
      },
    },
    build: {
      emptyOutDir: true,
    },
    test: {
      root: "./src",
      environment: "jsdom",
    },
  };

  if (command === "serve" || (command === "build" && mode === "example")) {
    config.root = examplePath;
  }

  if (command === "build" && mode === "lib") {
    config.root = rootPath;

    config.build.lib = {
      entry: srcPath,
      formats: ["es", "umd"],
      name,
      fileName: (format) => `index.${format}.js`,
    };
  }

  return config;
});
