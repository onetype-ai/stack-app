import { readFileSync } from "node:fs";
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

test("every key the contract accepts is documented", () =>
{
    const contract = readFileSync(
        join(ROOT, "packages", "stack-app-kit", "src", "plugins", "kernel", "internal", "contract.ts"),
        "utf8",
    );

    const procedure = readFileSync(join(ROOT, "#docs", "procedures", "plugin", "contract.md"), "utf8");

    expect(undocumented(contract, procedure)).toEqual([]);
});
