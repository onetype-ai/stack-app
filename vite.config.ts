import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

import { serving, settings } from "@onetype/stack-app-kit";
import { prerenderOnBuild } from "@onetype/stack-app-kit/server";

const resolvePath = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig(({ mode }) =>
{
    const set = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [
            react(),
            settings.refusingSecrets({ application: ["VITE_API_URL", "VITE_WS_URL", "VITE_LOG_LEVEL"] }),
            prerenderOnBuild({ entry: "src/prerender.tsx", origin: set["SITE_ORIGIN"] }),
        ],
        server: serving({ set }),
        resolve: {
            dedupe: ["react", "react-dom"],
            alias: [
                { find: /^@ui$/, replacement: resolvePath("./src/ui/index.ts") },
                { find: /^@ui\//, replacement: `${resolvePath("./src/ui")}/` },
                { find: /^@plugins\//, replacement: `${resolvePath("./src/plugins")}/` },
                { find: /^@utils\//, replacement: `${resolvePath("./src/utils")}/` },
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
    };
});
