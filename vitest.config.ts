import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
    viteConfig({ mode: "test", command: "serve" }),
    defineConfig({
        test: {
            environment: "jsdom",
            globals: true,
            setupFiles: ["./tests/setup.ts"],
            include: ["src/**/tests/**/*.test.{ts,tsx}"],
            passWithNoTests: false,

            // Project.checks() reads the tree from disk, so nothing it looks
            // at is an import a watcher would follow. Without this, a
            // boundary broken while dev runs stays green until verify.
            forceRerunTriggers: ["**/src/**/*.{ts,tsx,css}"],
            typecheck: {
                enabled: true,
                include: ["src/**/tests/**/*.test.{ts,tsx}"],
                tsconfig: "./tsconfig.json",
            },
        },
    }),
);
