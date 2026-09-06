import { describe, expect, test } from "vitest";

import { createPartsService } from "../services/parts";
import { fakeContext } from "./setup";

const bolt = {
    id: "5f1a0a3e-1c2b-4f0a-9a11-000000000001",
    name: "Hex bolt M8",
    kind: "fastener",
    cents: 140,
    stock: 220,
};

const seal = {
    id: "5f1a0a3e-1c2b-4f0a-9a11-000000000004",
    name: "O ring 12mm",
    kind: "seal",
    cents: 310,
    stock: 64,
};

describe("listing what the depot stocks", () =>
{
    test("asks the shelves and answers what came back", async () =>
    {
        const fake = fakeContext({ "GET /catalog/parts": { parts: [bolt, seal], total: 2 } });

        const page = await createPartsService(fake.ctx).list();

        expect(page.total).toBe(2);
        expect(fake.asked).toEqual([{ method: "GET", path: "/catalog/parts", query: {} }]);
    });

    test("carries the kind into the request, so the server filters and not the page", async () =>
    {
        const fake = fakeContext({ "GET /catalog/parts": { parts: [seal], total: 1 } });

        await createPartsService(fake.ctx).list({ kind: "seal" });

        expect(fake.asked[0]?.query).toEqual({ kind: "seal" });
    });

    test("and refuses a kind the depot does not stock, before any request is made", async () =>
    {
        const fake = fakeContext({ "GET /catalog/parts": { parts: [], total: 0 } });

        await expect(createPartsService(fake.ctx).list({ kind: "sprocket" } as never)).rejects.toThrow();

        expect(fake.asked).toEqual([]);
    });

    test("and refuses a page the server malformed, rather than rendering half a shelf", async () =>
    {
        const fake = fakeContext({ "GET /catalog/parts": { parts: [{ ...bolt, cents: -4 }], total: 1 } });

        await expect(createPartsService(fake.ctx).list()).rejects.toThrow();
    });
});

describe("what a part costs", () =>
{
    test("comes from the shelves the first time it is asked", async () =>
    {
        const fake = fakeContext({ [`GET /catalog/parts/${bolt.id}`]: bolt });

        expect(await createPartsService(fake.ctx).price(bolt.id)).toBe(140);
    });

    /**
     * The cart asks this for every line. A request per line would make a list
     * of twenty parts twenty round trips for prices already on the screen.
     */
    test("and from what the listing already carried, once it has been listed", async () =>
    {
        const fake = fakeContext({ "GET /catalog/parts": { parts: [bolt], total: 1 } });
        const parts = createPartsService(fake.ctx);

        await parts.list();

        expect(await parts.price(bolt.id)).toBe(140);
        expect(fake.asked).toHaveLength(1);
    });
});

describe("withdrawing a part from stock", () =>
{
    test("asks first, and says so afterwards", async () =>
    {
        const fake = fakeContext({
            "GET /catalog/parts": { parts: [bolt], total: 1 },
            [`DELETE /catalog/parts/${bolt.id}`]: bolt,
        });

        const parts = createPartsService(fake.ctx);

        await parts.list();
        await parts.withdraw(bolt.id);

        expect(fake.asked.map((one) => one.method)).toEqual(["GET", "DELETE"]);
        expect(fake.told).toEqual([{ event: "catalog.part.withdrawn", payload: { id: bolt.id, name: bolt.name } }]);
    });

    /**
     * The refusal is the point of the hook. Without this the participant could
     * answer anything and the part would leave the shelves regardless.
     */
    test("stops when a participant refuses, and nothing is written or announced", async () =>
    {
        const fake = fakeContext({
            "GET /catalog/parts": { parts: [bolt], total: 1 },
            [`DELETE /catalog/parts/${bolt.id}`]: bolt,
        });

        fake.refusal = "somebody has it on a pick list";

        const parts = createPartsService(fake.ctx);

        await parts.list();

        await expect(parts.withdraw(bolt.id)).rejects.toThrow(/somebody has it on a pick list/);

        expect(fake.asked.map((one) => one.method)).toEqual(["GET"]);
        expect(fake.told).toEqual([]);
    });

    test("and drops the cached shelves, so a list does not still show it", async () =>
    {
        const fake = fakeContext({
            "GET /catalog/parts": { parts: [bolt], total: 1 },
            [`DELETE /catalog/parts/${bolt.id}`]: bolt,
        });

        const parts = createPartsService(fake.ctx);

        await parts.list();
        await parts.withdraw(bolt.id);

        expect(fake.dropped).toEqual([["catalog", "parts"]]);
    });
});
