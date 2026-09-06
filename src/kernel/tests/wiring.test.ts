import { join } from "node:path";
import { expect, test } from "vitest";

import { findUnusedFields } from "@onetype/stack-app-kit/testing";

test("nothing a plugin declares goes unread", () =>
{
    expect(findUnusedFields(join(process.cwd(), "src", "plugins"))).toEqual([]);
});
