import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { findMissingDocs, findOversizedDocs, findUndocumentedKeys, findUnexplainedPlugins } from "@onetype/stack-app-kit/testing";

const ROOT = process.cwd();

/* Packed into docs.md, so a check that reads them has nothing until unpacked. */
const unpacked = existsSync(join(ROOT, "#docs"));

describe.skipIf(!unpacked)("the documents this application ships", () =>
{
    test("every contract document stays within 1800 characters", () =>
    {
        const over = findOversizedDocs(join(ROOT, "#docs")).map((doc) =>
        {
            return `${doc.path.replace(`${ROOT}/`, "")}: ${doc.size}`;
        });

        expect(over).toEqual([]);
    });

    test("the root documents are present and say something", () =>
    {
        const required = ["#docs/usage.md", "#docs/stack.md", "#docs/architecture.md"];

        expect(findMissingDocs(ROOT, required)).toEqual([]);
    });

/* Found by what it holds: tsup's chunk name carries a hash that moves. */
const declared = (): string =>
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
        const contract = declared();
        const procedure = readFileSync(join(ROOT, "#docs", "procedures", "plugin", "contract.md"), "utf8");

        /* An empty answer means it parsed; a vanished shape throws above. */
        expect(findUndocumentedKeys(contract, procedure)).toEqual([]);
    });
});

/* Reads src/plugins, not #docs, so it holds whether the documents are packed
   or not: a plugin nobody can read is one nobody can depend on. */
test("every plugin explains itself in its own usage.md", () =>
{
    expect(findUnexplainedPlugins(join(ROOT, "src", "plugins"))).toEqual([]);
});
