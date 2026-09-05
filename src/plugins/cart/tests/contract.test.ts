import { describe, expect, test } from "vitest";

import cart from "../plugin";
import { createPickingService } from "../services/picking";
import { Bay } from "../types/Bay";
import { serving } from "./serving";

import type { Context } from "@onetype/stack-app-kit";
import type { PickingService } from "../services/picking";
import type { CartConfig } from "../types/CartConfig";

const bolt = "5f1a0a3e-1c2b-4f0a-9a11-000000000001";

const inside = (fake: ReturnType<typeof serving>): Context<CartConfig, { picking: PickingService }> =>
{
    const picking = createPickingService(fake.ctx);

    return { ...fake.ctx, services: { picking } };
};

describe("a bay a list is handed to", () =>
{
    test("is taken as it is painted on the aisle", () =>
    {
        expect(Bay.parse("ac-12")).toBe("AC-12");
    });

    /**
     * A command's schema refuses this too, but by then the reader has already
     * confirmed a modal. Refusing here puts the message beside the field.
     */
    test("and refused with what was typed, when it is not one", () =>
    {
        expect(() => Bay.parse("aisle twelve")).toThrow(/"aisle twelve"/);
        expect(() => Bay.parse("")).toThrow();
    });
});

describe("handing the list over", () =>
{
    const command = cart.definition.commands?.["cart.hand-over"];

    test("asks for the permission the cart defined, and not a wider one", () =>
    {
        expect(command?.requires).toEqual(["cart.use"]);
    });

    test("takes a bay", () =>
    {
        expect(command?.schema.parse({ bay: "AC-12" })).toEqual({ bay: "AC-12" });
    });

    test("and refuses one that is not a bay, before anything is emptied", () =>
    {
        expect(() => command?.schema.parse({ bay: "over there" })).toThrow();
    });

    test("empties the list once it has gone", async () =>
    {
        const fake = serving();
        const ctx = inside(fake);
        const picking = ctx.services.picking;

        await picking.add(bolt, "Hex bolt M8");

        await command?.run({ bay: "AC-12" }, ctx);

        expect(picking.read().items).toBe(0);
    });

    /**
     * The page disables the button, which is not a guard: a command runs from
     * anywhere a context exists, and an empty handover is a bay sent nothing.
     */
    test("but refuses an empty one, whatever the page allowed", () =>
    {
        const fake = serving();
        const ctx = inside(fake);

        expect(() => command?.run({ bay: "AC-12" }, ctx)).toThrow(/empty pick list/);
    });
});

describe("a part somebody means to pull", () =>
{
    const participant = cart.definition.participates?.["catalog.part.before-withdraw"];

    test("stops the catalog from withdrawing it, and says which part", async () =>
    {
        const fake = serving();
        const ctx = inside(fake);
        const picking = ctx.services.picking;

        await picking.add(bolt, "Hex bolt M8");

        expect(participant?.handle({ id: bolt, name: "Hex bolt M8" }, ctx)).toMatch(/Hex bolt M8/);
    });

    test("and lets one nobody holds go", () =>
    {
        const fake = serving();

        expect(participant?.handle({ id: bolt, name: "Hex bolt M8" }, inside(fake))).toBeUndefined();
    });

    test("and refuses a payload that is not a part, rather than answering about nothing", () =>
    {
        const fake = serving();

        expect(() => participant?.handle({ id: "bolt" }, inside(fake))).toThrow();
    });
});

describe("a part that left the shelves while a list held it", () =>
{
    const listener = cart.definition.listens?.["catalog.part.withdrawn"];

    test("is struck off, so nobody is sent to pull what is gone", async () =>
    {
        const fake = serving();
        const ctx = inside(fake);
        const picking = ctx.services.picking;

        await picking.add(bolt, "Hex bolt M8");

        await listener?.handle({ id: bolt, name: "Hex bolt M8" }, ctx);

        expect(picking.read().lines[0]?.gone).toBe(true);
        expect(picking.read().items).toBe(0);
    });

    test("and a payload that is not one is refused rather than striking nothing quietly", () =>
    {
        const fake = serving();

        expect(() => listener?.handle({ id: "gone" }, inside(fake))).toThrow();
    });
});

describe("the handover page", () =>
{
    const handover = cart.definition.routes?.find((one) => one.path === "/cart/handover");

    /**
     * An empty list is not forbidden, it is early. Answering a path sends the
     * reader before the page renders, so the wrong screen never flashes.
     */
    test("sends a reader with an empty list back to the list itself", () =>
    {
        const fake = serving();

        expect(handover?.instead?.(inside(fake))).toBe("/cart");
    });

    test("and lets one with something on it through", async () =>
    {
        const fake = serving();
        const ctx = inside(fake);
        const picking = ctx.services.picking;

        await picking.add(bolt, "Hex bolt M8");

        expect(handover?.instead?.(ctx)).toBeUndefined();
    });

    test("and asks for the cart's own permission to be seen at all", () =>
    {
        expect(handover?.requires).toEqual(["cart.use"]);
    });
});

describe("what the cart puts beside a part", () =>
{
    const contribution = cart.definition.contributes?.find((one) => one.slot === "catalog.part.aside");

    test("goes into the slot the catalog opened, and asks for the cart's permission", () =>
    {
        expect(contribution?.slot).toBe("catalog.part.aside");
        expect(contribution?.requires).toEqual(["cart.use"]);
    });

    test("and the cart names the catalog it reaches into", () =>
    {
        expect(cart.definition.dependsOn).toEqual(["catalog"]);
    });
});
