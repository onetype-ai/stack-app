import { join } from "node:path";
import { expect, test } from "vitest";

import { findImportViolations } from "@onetype/stack-app-kit/testing";

test("no plugin reaches another undeclared, past its index, or in a loop", () =>
{
    expect(findImportViolations(join(process.cwd(), "src", "plugins"))).toEqual([]);
});
