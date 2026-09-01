import { join } from "node:path";
import { expect, test } from "vitest";

import { wiring } from "@onetype/stack-app-kit/testing";

test("nothing a plugin declares goes unread", () =>
{
    expect(wiring(join(process.cwd(), "src", "plugins"))).toEqual([]);
});
