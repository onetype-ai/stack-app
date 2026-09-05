import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

import { missing, oversized, undocumented } from "@onetype/stack-app-kit/testing";

const ROOT = process.cwd();

test("every contract document stays within 1800 characters", () =>
{
    const over = oversized(join(ROOT, "#docs")).map((doc) =>
    {
        return `${doc.path.replace(`${ROOT}/`, "")}: ${doc.size}`;
    });

    expect(over).toEqual([]);
});

test("the root documents are present and say something", () =>
{
    const required = ["#docs/usage.md", "#docs/stack.md", "#docs/architecture.md"];

    expect(missing(ROOT, required)).toEqual([]);
});

// The kit is a dependency, so the contract is read from its published types.
// tsup names the shared chunk with a build hash, so the file is found by what
// it holds rather than by a name that changes on every build.
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

    // An empty answer means the shape parsed; a shape that vanished throws above.
    expect(undocumented(contract, procedure)).toEqual([]);
});
