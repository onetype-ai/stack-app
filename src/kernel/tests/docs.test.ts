import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { findMissingDocs, findOversizedDocs, findUndocumentedKeys, findUnexplainedPlugins } from "@onetype/stack-app-kit/testing";

const ROOT = process.cwd();

const unpacked = existsSync(join(ROOT, "#docs"));

describe.skipIf(!unpacked)("the documents this application ships, once unpacked from docs.md", () =>
{
    test("every contract document stays within 1800 characters", () =>
    {
        const oversized = findOversizedDocs(join(ROOT, "#docs")).map((doc) =>
        {
            return `${doc.path.replace(`${ROOT}/`, "")}: ${doc.size}`;
        });

        expect(oversized).toEqual([]);
    });

    test("the root documents are present and say something", () =>
    {
        const required = ["#docs/stack/usage.md", "#docs/stack/stack.md", "#docs/stack/architecture.md"];

        expect(findMissingDocs(ROOT, required)).toEqual([]);
    });

const declaredByWhateverChunkHoldsIt = (): string =>
{
    const at = join(ROOT, "node_modules", "@onetype", "stack-app-kit", "dist");

    for (const name of readdirSync(at).filter((file) => file.endsWith(".d.ts")))
    {
        const source = readFileSync(join(at, name), "utf8");

        if (/type Definition[\s\S]*?\n\};/.test(source))
        {
            return source;
        }
    }

    throw new Error("No published type declares Definition, so nothing would be checked.");
};

    test("every key the contract accepts is documented", () =>
    {
        const contract = declaredByWhateverChunkHoldsIt();
        const procedure = readFileSync(join(ROOT, "#docs", "plugin", "contract.md"), "utf8");

        expect(findUndocumentedKeys(contract, procedure)).toEqual([]);
    });
});

test("every plugin explains itself in its own usage.md, packed documents or not", () =>
{
    expect(findUnexplainedPlugins(join(ROOT, "src", "plugins"))).toEqual([]);
});
