import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "MobileAppDesigner",
      formats: ["iife"],
      fileName: () => "canvas.min.js",
    },
    outDir: resolve(__dirname, "../assets"),
    emptyOutDir: false,
    minify: "esbuild",
    cssMinify: true,
  },
});
