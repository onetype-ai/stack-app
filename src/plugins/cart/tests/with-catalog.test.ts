import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, test } from "vitest";

import { mount, source } from "../../../kernel";

import type { Kernel } from "@onetype/stack-app-kit";
import type { CatalogServices } from "@plugins/catalog";
import type { CartServices } from "../index";

// Every other test here writes its own catalog, so a cart that only works
// against a fake passes there and fails here.
const bolt = "5f1a0a3e-1c2b-4f0a-9a11-000000000001";
const seal = "5f1a0a3e-1c2b-4f0a-9a11-000000000004";

const pickingOf = (kernel: Kernel): CartServices["picking"] =>
{
    return kernel.context("cart").use<CartServices>("cart").picking;
};

const partsOf = (kernel: Kernel): CatalogServices["parts"] =>
{
    return kernel.context("cart").use<CatalogServices>("catalog").parts;
};

afterEach(() =>
{
    source.reset();
});

describe("the cart and the catalog together", () =>
{
    test("price a line from the catalog and from nowhere else", async () =>
    {
        const app = await mount(new QueryClient());

        await pickingOf(app.kernel).add(bolt, "Hex bolt M8");

        expect(pickingOf(app.kernel).read().cents).toBe(140);

        await app.stop();
    });

    /**
     * The refusal crosses two boundaries: the catalog runs its hook, the cart
     * answers it, and the part stays where it is. Neither imports the other.
     */
    test("stop a part leaving the shelves while a pick list holds it", async () =>
    {
        const app = await mount(new QueryClient());

        await pickingOf(app.kernel).add(bolt, "Hex bolt M8");

        await expect(partsOf(app.kernel).withdraw(bolt)).rejects.toThrow(/on a pick list/);
        await expect(partsOf(app.kernel).get(bolt)).resolves.toBeDefined();

        await app.stop();
    });

    test("but let one nobody holds go, and leave the held line standing", async () =>
    {
        const app = await mount(new QueryClient());

        await pickingOf(app.kernel).add(bolt, "Hex bolt M8");
        await partsOf(app.kernel).withdraw(seal);

        expect(pickingOf(app.kernel).read().lines.find((line) => line.partId === bolt)?.gone).toBe(false);

        await app.stop();
    });
});

describe("the catalog behind the depot this application ships", () =>
{
    test("answers the shelves through its own service", async () =>
    {
        const app = await mount(new QueryClient());

        expect((await partsOf(app.kernel).list({})).total).toBeGreaterThan(0);

        await app.stop();
    });

    test("narrows them to the kind that was asked for", async () =>
    {
        const app = await mount(new QueryClient());
        const page = await partsOf(app.kernel).list({ kind: "seal" });

        expect(page.parts.length).toBeGreaterThan(0);
        expect(page.parts.every((part) => part.kind === "seal")).toBe(true);

        await app.stop();
    });

    test("and answers nothing for a part it never stocked", async () =>
    {
        const app = await mount(new QueryClient());

        await expect(partsOf(app.kernel).get("5f1a0a3e-1c2b-4f0a-9a11-000000000999")).rejects.toThrow();

        await app.stop();
    });
});
