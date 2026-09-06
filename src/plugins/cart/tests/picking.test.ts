import { describe, expect, test } from "vitest";

import { createPickingService } from "../services/picking";
import { fakeContext } from "./setup";

const bolt = "5f1a0a3e-1c2b-4f0a-9a11-000000000001";
const seal = "5f1a0a3e-1c2b-4f0a-9a11-000000000004";

describe("putting a part on the pick list", () =>
{
    /**
     * The price is never invented here. A cart holding its own number shows
     * one thing and the catalog another, and only one of them is charged.
     */
    test("takes the price from the catalog and never from itself", async () =>
    {
        const fake = fakeContext();

        fake.price = 310;

        const picking = createPickingService(fake.ctx);

        await picking.add(seal, "O ring 12mm");

        expect(fake.priced).toEqual([seal]);
        expect(picking.read().cents).toBe(310);
    });

    test("counts the same part again rather than listing it twice", async () =>
    {
        const fake = fakeContext();
        const picking = createPickingService(fake.ctx);

        await picking.add(bolt, "Hex bolt M8");
        await picking.add(bolt, "Hex bolt M8");

        expect(picking.read().lines).toHaveLength(1);
        expect(picking.read().items).toBe(2);
    });

    test("and asks the catalog only once for a part it already carries", async () =>
    {
        const fake = fakeContext();
        const picking = createPickingService(fake.ctx);

        await picking.add(bolt, "Hex bolt M8");
        await picking.add(bolt, "Hex bolt M8");

        expect(fake.priced).toEqual([bolt]);
    });

    test("refuses to run past the lines its config allows", async () =>
    {
        const fake = fakeContext({ maxLines: 1 });
        const picking = createPickingService(fake.ctx);

        await picking.add(bolt, "Hex bolt M8");

        await expect(picking.add(seal, "O ring 12mm")).rejects.toThrow(/past 1 lines/);

        expect(picking.read().lines).toHaveLength(1);
    });

    test("and to ask for more of one part than its config allows", async () =>
    {
        const fake = fakeContext({ maxQuantity: 1 });
        const picking = createPickingService(fake.ctx);

        await picking.add(bolt, "Hex bolt M8");

        await expect(picking.add(bolt, "Hex bolt M8")).rejects.toThrow(/more than 1/);

        expect(picking.read().items).toBe(1);
    });

    test("and adds nothing when the catalog could not answer what it costs", async () =>
    {
        const fake = fakeContext();

        fake.refuse = "no part carries that number";

        const picking = createPickingService(fake.ctx);

        await expect(picking.add(bolt, "Hex bolt M8")).rejects.toThrow(/no part carries that number/);

        expect(picking.read().lines).toEqual([]);
    });
});

describe("what the pick list adds up to", () =>
{
    test("counts every line by what it asks for", async () =>
    {
        const fake = fakeContext();
        const picking = createPickingService(fake.ctx);

        fake.price = 140;
        await picking.add(bolt, "Hex bolt M8");
        await picking.add(bolt, "Hex bolt M8");

        fake.price = 310;
        await picking.add(seal, "O ring 12mm");

        expect(picking.read().cents).toBe(140 * 2 + 310);
        expect(picking.read().items).toBe(3);
    });

    /**
     * A struck line stays visible so the reader knows why, but charging for
     * a part nobody can pull is the bug this closes.
     */
    test("but leaves out a line whose part left the shelves", async () =>
    {
        const fake = fakeContext();
        const picking = createPickingService(fake.ctx);

        await picking.add(bolt, "Hex bolt M8");
        picking.strike(bolt);

        expect(picking.read().lines).toHaveLength(1);
        expect(picking.read().cents).toBe(0);
        expect(picking.read().items).toBe(0);
    });
});

describe("what the cart tells anyone watching", () =>
{
    test("says so when a line arrives", async () =>
    {
        const fake = fakeContext();
        const picking = createPickingService(fake.ctx);

        let moves = 0;

        picking.watch(() => { moves += 1; });

        await picking.add(bolt, "Hex bolt M8");

        expect(moves).toBe(1);
    });

    test("and stops telling whoever stopped listening", async () =>
    {
        const fake = fakeContext();
        const picking = createPickingService(fake.ctx);

        let moves = 0;

        const stop = picking.watch(() => { moves += 1; });

        stop();

        await picking.add(bolt, "Hex bolt M8");

        expect(moves).toBe(0);
    });

    /**
     * `useStore` re-renders forever when the value it reads is a new object
     * each call. This is what keeps it one object between moves.
     */
    test("and answers the same object until something moves", async () =>
    {
        const fake = fakeContext();
        const picking = createPickingService(fake.ctx);

        expect(picking.read()).toBe(picking.read());

        await picking.add(bolt, "Hex bolt M8");

        const after = picking.read();

        expect(after).toBe(picking.read());
    });
});

describe("striking a part off", () =>
{
    test("does nothing when the list never carried it", () =>
    {
        const fake = fakeContext();
        const picking = createPickingService(fake.ctx);

        let moves = 0;

        picking.watch(() => { moves += 1; });

        picking.strike(bolt);

        expect(moves).toBe(0);
    });
});
