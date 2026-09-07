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
        },
    }),
);
