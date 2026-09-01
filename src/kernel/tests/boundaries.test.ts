import { join } from "node:path";
import { expect, test } from "vitest";

import { boundaries } from "@onetype/stack-app-kit/testing";

test("no plugin reaches another undeclared, past its index, or in a loop", () =>
{
    expect(boundaries(join(process.cwd(), "src", "plugins"))).toEqual([]);
});
