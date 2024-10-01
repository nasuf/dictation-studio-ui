import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { join } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": join(__dirname, "./src/"),
    },
  },
});
function tailwindcss(): import("vite").PluginOption {
  throw new Error("Function not implemented.");
}
