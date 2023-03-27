// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    publicDir: "assets",
    css: {
        modules: {
            scopeBehaviour: "local",
            localsConvention: "camelCaseOnly",
            hashPrefix: "my-custom-hash",
            globalModulePaths: [/global\.css$/],
        },
    },
});
