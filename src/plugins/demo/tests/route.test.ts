import { describe, expect, test } from "vitest";

import demo from "../plugin";

/**
 * What the list is filtered by lives in the address, so a link carries it and
 * a reload keeps it. Declared on the route: undeclared means it does not
 * exist, here as everywhere.
 */
describe("what the items route takes from the url", () =>
{
    const listing = demo.definition.routes?.find((one) => one.path === "/demo");

    test("is declared, so the kernel can parse it", () =>
    {
        expect(listing?.search).toBeDefined();
    });

    test("takes a status the plugin knows", () =>
    {
        expect(listing?.search?.parse({ status: "active" })).toEqual({ status: "active" });
    });

    test("and refuses one it does not, rather than passing it to a query", () =>
    {
        expect(() => listing?.search?.parse({ status: "whatever" })).toThrow();
    });

    test("with nothing at all being a listing of everything", () =>
    {
        expect(listing?.search?.parse({})).toEqual({});
    });
});
