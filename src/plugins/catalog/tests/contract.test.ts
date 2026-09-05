import { describe, expect, test } from "vitest";

import catalog from "../plugin";
import { PartId } from "../types/PartId";

/**
 * What the list is filtered by lives in the address, so a link carries it and
 * a reload keeps it. Declared on the route: undeclared means it does not
 * exist, here as everywhere.
 */
describe("what the stock route takes from the address", () =>
{
    const listing = catalog.definition.routes?.find((one) => one.path === "/catalog");

    test("is declared, so the kernel parses it before the page renders", () =>
    {
        expect(listing?.search).toBeDefined();
    });

    test("takes a kind the depot stocks", () =>
    {
        expect(listing?.search?.parse({ kind: "seal" })).toEqual({ kind: "seal" });
    });

    test("and refuses one it does not, rather than handing it to a request", () =>
    {
        expect(() => listing?.search?.parse({ kind: "sprocket" })).toThrow();
    });

    test("with nothing at all meaning everything stocked", () =>
    {
        expect(listing?.search?.parse({})).toEqual({});
    });
});

describe("the slot a part opens beside itself", () =>
{
    const aside = catalog.definition.slots?.["catalog.part.aside"];

    test("hands a contribution the number, the name and the price", () =>
    {
        expect(aside?.schema.parse({ id: "5f1a0a3e-1c2b-4f0a-9a11-000000000001", name: "Hex bolt M8", cents: 140 }))
            .toEqual({ id: "5f1a0a3e-1c2b-4f0a-9a11-000000000001", name: "Hex bolt M8", cents: 140 });
    });

    /**
     * A contribution that could not learn the price would have to ask for it,
     * and the mechanism would be a slot in name only.
     */
    test("and refuses a payload missing the price, at startup rather than on screen", () =>
    {
        expect(() => aside?.schema.parse({ id: "5f1a0a3e-1c2b-4f0a-9a11-000000000001", name: "Hex bolt M8" })).toThrow();
    });

    test("and one whose price is not a whole number of cents", () =>
    {
        expect(() => aside?.schema.parse({ id: "5f1a0a3e-1c2b-4f0a-9a11-000000000001", name: "Hex bolt M8", cents: 1.5 }))
            .toThrow();
    });
});

describe("a part number read out of the address", () =>
{
    test("is answered when it is one", () =>
    {
        expect(PartId.parse("5f1a0a3e-1c2b-4f0a-9a11-000000000001"))
            .toBe("5f1a0a3e-1c2b-4f0a-9a11-000000000001");
    });

    /**
     * Without this a typed address becomes a request for "undefined", and the
     * page shows a transport error rather than saying the address is wrong.
     */
    test("and refused with what arrived, when it is not", () =>
    {
        expect(() => PartId.parse("bolt")).toThrow(/"bolt"/);
        expect(() => PartId.parse(undefined)).toThrow(/undefined/);
    });
});

describe("what the catalog announces", () =>
{
    test("carries the number and the name, because a listener has nobody to ask", () =>
    {
        const withdrawn = catalog.definition.emits?.["catalog.part.withdrawn"];

        expect(withdrawn?.schema.parse({ id: "5f1a0a3e-1c2b-4f0a-9a11-000000000001", name: "Hex bolt M8" }))
            .toEqual({ id: "5f1a0a3e-1c2b-4f0a-9a11-000000000001", name: "Hex bolt M8" });
    });

    test("and is refused when the number is not one", () =>
    {
        const withdrawn = catalog.definition.emits?.["catalog.part.withdrawn"];

        expect(() => withdrawn?.schema.parse({ id: "gone", name: "Hex bolt M8" })).toThrow();
    });
});
