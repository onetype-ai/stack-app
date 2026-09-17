import { expect, test } from "vitest";

import { Queries } from "../queries";

test("a query client retries nothing, because the transport already retries and two layers multiply the attempts", () =>
{
    expect(Queries.create().getDefaultOptions().queries?.retry).toBe(false);
});
