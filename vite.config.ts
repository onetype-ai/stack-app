import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const resolvePath = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

const whole = (name: string, fallback: number, set: Record<string, string>): number =>
{
    const given = set[name] ?? process.env[name];

    if (given === undefined || given === "")
    {
        return fallback;
    }

    const asNumber = Number(given);

    if (!Number.isInteger(asNumber) || asNumber < 1 || asNumber > 65_535)
    {
        throw new Error(`${name} must be a whole port between 1 and 65535. Received "${given}".`);
    }

    return asNumber;
};

export default defineConfig(({ mode }) =>
{
    const set = loadEnv(mode, process.cwd(), "");

    const port = whole("PORT", 7380, set);
    const apiPort = whole("API_PORT", 7280, set);

    return {
        plugins: [react()],
        server: {
            port,
            strictPort: true,
            proxy: {
                "/api": {
                    target: `http://localhost:${String(apiPort)}`,
                    changeOrigin: true,
                    rewrite: (path: string) => path.replace(/^\/api/, ""),
                },
            },
        },
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
