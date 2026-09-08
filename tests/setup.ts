import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

const held = new Map<string, string>();

Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
        getItem: (key: string): string | null => held.get(key) ?? null,
        setItem: (key: string, value: string): void =>
        {
            held.set(key, value);
        },
        removeItem: (key: string): void =>
        {
            held.delete(key);
        },
        clear: (): void =>
        {
            held.clear();
        },
        key: (at: number): string | null => [...held.keys()][at] ?? null,
        get length(): number
        {
            return held.size;
        },
    },
});

afterEach(() =>
{
    cleanup();
    held.clear();
});
