import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    css: {
        postcss: "./postcss.config.js",
    },
    define: {
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    optimizeDeps: {
        include: [
            "react",
            "react-dom",
            "antd",
            "react-router-dom",
            "@ant-design/icons",
            "axios",
            "lodash",
        ],
        exclude: [],
    },
    server: {
        fs: {
            strict: false,
        },
    },
});
