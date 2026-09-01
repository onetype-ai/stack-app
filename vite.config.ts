import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const resolvePath = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
    plugins: [react()],
    resolve: {
        dedupe: ["react", "react-dom"],
        alias: [
            { find: /^@ui$/, replacement: resolvePath("./src/ui/index.ts") },
            { find: /^@ui\//, replacement: `${resolvePath("./src/ui")}/` },
            { find: /^@onetype\/stack-app-kit$/, replacement: resolvePath("./packages/stack-app-kit/src/index.ts") },
            { find: /^@onetype\/stack-app-kit\/react$/, replacement: resolvePath("./packages/stack-app-kit/src/plugins/kernel/react/index.tsx") },
            { find: /^@onetype\/stack-app-kit\/testing$/, replacement: resolvePath("./packages/stack-app-kit/src/testing.ts") },
            { find: /^@plugins\//, replacement: `${resolvePath("./src/plugins")}/` },
        ],
    },
    css: {
        modules: {
            localsConvention: "camelCaseOnly",
            generateScopedName: "[name]__[local]__[hash:base64:5]",
        },
    },
    build: {
        target: "es2023",
        sourcemap: true,
    },
});
