import { resolve } from "path";
import { transform } from "esbuild";
import { defineConfig } from "vite";
import packageContent from "./package.json";

function minifyEs() {
  return {
    name: "minifyEs",
    renderChunk: {
      order: "post",
      async handler(code, chunk, outputOptions) {
        if (outputOptions.format === "es") {
          return await transform(code, { minify: true });
        }
        return code;
      },
    },
  };
}

export default defineConfig({
  plugins: [minifyEs()],
  root: resolve(__dirname, "./playground"),
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "./src/index.js"),
      formats: ["es", "umd"],
      name: packageContent.name,
      fileName: (format) => `index.${format}.js`,
    },
    emptyOutDir: true,
  },
});
