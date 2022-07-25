/// <reference types="vite/client" />
/// <reference types="vitest" />

import { resolve } from "path";

import yaml from "@rollup/plugin-yaml";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import cesium from "vite-plugin-cesium";

export default defineConfig({
  envPrefix: "REEARTH_",
  plugins: [react(), yaml(), cesium()],
  resolve: {
    alias: [
      { find: "@reearth", replacement: resolve(__dirname, "src") },
      {
        find: /^~/,
        replacement: "",
      },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    coverage: {
      reporter: ["text", "json"],
    },
  },
});
