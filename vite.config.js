import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["kepler.gl"], // don't try to prebundle it
  },
  resolve: {
    alias: {
      "kepler.gl": path.resolve(__dirname, "node_modules/kepler.gl/dist"),
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
