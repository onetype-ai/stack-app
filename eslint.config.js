import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const boundary = (message, patterns) => ({
    "no-restricted-imports": ["error", { patterns: patterns.map((group) => ({ ...group, message })) }],
});

export default tseslint.config(
    {
        ignores: ["**/dist/**", "**/node_modules/**", "**/*.config.ts", "**/*.config.js"],
    },

    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,

    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-misused-promises": "error",
            "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "separate-type-imports" }],
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
            "no-console": "error",
            eqeqeq: ["error", "always"],
        },
    },

    {
        files: ["src/ui/**/*.{ts,tsx}"],
        rules: boundary(
            "ui is shared and knows no domain. It must not import a plugin or the kernel.",
            [
                { group: ["@plugins/*", "**/plugins/**"] },
                { group: ["@kernel", "@kernel/*", "@onetype/app-kernel", "@onetype/app-kernel/*"] },
            ],
        ),
    },

    {
        files: ["src/plugins/*/**/*.{ts,tsx}"],
        rules: boundary(
            "A plugin may only import another plugin through its public index: @plugins/<name>.",
            [{ group: ["@plugins/*/*", "@plugins/*/*/**"] }],
        ),
    },

    {
        files: ["src/plugins/**/services/**/*.ts", "src/plugins/**/components/**/*.tsx", "src/plugins/**/sections/**/*.tsx"],
        rules: {
            "no-restricted-globals": ["error", { name: "fetch", message: "Go through ctx.http, which the transport plugin owns." }],
        },
    },

    {
        files: ["src/**/*.tsx", "packages/*/*/src/react/**/*.tsx"],
        plugins: { "react-hooks": reactHooks },
        rules: {
            ...reactHooks.configs.recommended.rules,
        },
    },

    {
        files: ["src/kernel/**/*.{ts,tsx}", "packages/*/*/src/runtime/logger.ts"],
        rules: {
            "no-console": "off",
        },
    },

    {
        files: ["**/tests/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "no-console": "off",
        },
    },
);
