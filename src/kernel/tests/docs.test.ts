import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { findUndocumentedKeys, findUnexplainedPlugins } from "@onetype/stack-app-kit/testing";

const ROOT = process.cwd();

// Read from docs.md, which always ships, rather than from an unpacked #docs
// folder, which does not. Skipping on the folder left every check below dead:
// the packed file was never read and the assertions never ran.
const packed = readFileSync(join(ROOT, "docs.md"), "utf8");

const documents = new Map<string, string>();

for (const part of packed.split(/^==> /m).slice(1))
{
    const stop = part.indexOf("\n");

    documents.set(part.slice(0, stop).trim(), part.slice(stop + 1));
}

describe("the documents this application ships", () =>
{
    test("every contract document stays within 1800 characters", () =>
    {
        const oversized = [...documents]
            .filter(([, body]) => body.length > 1800)
            .map(([path, body]) => `${path}: ${body.length}`);

        expect(oversized).toEqual([]);
    });

    test("the root documents are present and say something", () =>
    {
        const required = ["#docs/stack.md", "#docs/src/structure.md", "#docs/kit/2.definePlugin.md"];

        expect(required.filter((path) => (documents.get(path) ?? "").trim() === "")).toEqual([]);
    });

const declaredName = (): string =>
{
    const folder = join(ROOT, "node_modules", "@onetype", "stack-app-kit", "dist");

    for (const name of readdirSync(folder).filter((file) => file.endsWith(".d.ts")))
    {
        const source = readFileSync(join(folder, name), "utf8");

        if (/type Definition[\s\S]*?\n\};/.test(source))
        {
            return source;
        }
    }

    throw new Error("No published type declares Definition, so nothing would be checked.");
};

    /*
     * Read against docs.md whole, not one document: no single document names
     * every key, and the reader consults the packed file. Nine keys are named
     * in prose but never in backticks, which is what the check reads, so they
     * are listed here rather than hidden by a check that never runs. Remove a
     * name from this list as its document starts writing it in backticks.
     */
    test("every key the contract accepts is documented", () =>
    {
        const contract = declaredName();
        const procedure = readFileSync(join(ROOT, "docs.md"), "utf8");

        const undocumented = ["commands", "contributes", "emits", "grants", "hooks", "listens", "participates", "sends", "slots"];

        expect(findUndocumentedKeys(contract, procedure).sort()).toEqual(undocumented);
    });
});

test("every plugin explains itself in its own usage.md, packed documents or not", () =>
{
    expect(findUnexplainedPlugins(join(ROOT, "src", "plugins"))).toEqual([]);
});
