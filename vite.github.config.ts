import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  root: "github",
  base: "./",
  plugins: [react()],
  publicDir: "../public",
  build: {
    outDir: "../github-dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve("github/index.html"),
        research: resolve("github/research.html"),
        experiment: resolve("github/experiment.html"),
        calculator: resolve("github/calculator.html"),
        twin: resolve("github/digital-twin.html"),
        about: resolve("github/about.html"),
      },
    },
  },
});
