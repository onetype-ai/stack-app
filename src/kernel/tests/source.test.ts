import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, test } from "vitest";

import { mount, source } from "../index";

afterEach(() =>
{
    source.reset();
});

/**
 * There is no server. What stands in for one answers over `fetch`, so a
 * plugin takes exactly the path it will take once there is one: a fake reached
 * through some other door would prove nothing about the real one.
 */
describe("an application with nothing but a fake depot behind it", () =>
{
    test("still finds a viewer, so a guarded route is not a blanket 403", async () =>
    {
        const app = await mount(new QueryClient());

        expect(app.kernel.permissions.has("catalog.read")).toBe(true);
        expect(app.kernel.permissions.has("cart.use")).toBe(true);

        await app.stop();
    });

    test("and refuses a permission nobody granted", async () =>
    {
        const app = await mount(new QueryClient());

        expect(app.kernel.permissions.has("catalog.destroy")).toBe(false);

        await app.stop();
    });

    test("answers the shelves through the catalog's own service", async () =>
    {
        const app = await mount(new QueryClient());
        const catalog = app.kernel.context("catalog") as { services: { parts: { list: () => Promise<{ total: number }> } } };

        expect((await catalog.services.parts.list()).total).toBeGreaterThan(0);

        await app.stop();
    });

    test("and narrows them to the kind that was asked for", async () =>
    {
        const app = await mount(new QueryClient());
        const catalog = app.kernel.context("catalog") as {
            services: { parts: { list: (query: { kind: string }) => Promise<{ parts: { kind: string }[] }> } };
        };

        const page = await catalog.services.parts.list({ kind: "seal" });

        expect(page.parts.length).toBeGreaterThan(0);
        expect(page.parts.every((one) => one.kind === "seal")).toBe(true);

        await app.stop();
    });

    test("and answers nothing for a part it never stocked", async () =>
    {
        const app = await mount(new QueryClient());
        const catalog = app.kernel.context("catalog") as {
            services: { parts: { get: (id: string) => Promise<unknown> } };
        };

        await expect(catalog.services.parts.get("5f1a0a3e-1c2b-4f0a-9a11-000000000999")).rejects.toThrow();

        await app.stop();
    });
});

describe("the two plugins together", () =>
{
    const bolt = "5f1a0a3e-1c2b-4f0a-9a11-000000000001";

    test("let the cart price a line from the catalog and from nowhere else", async () =>
    {
        const app = await mount(new QueryClient());
        const cart = app.kernel.context("cart") as {
            services: { picking: { add: (id: string, name: string) => Promise<void>; read: () => { cents: number } } };
        };

        await cart.services.picking.add(bolt, "Hex bolt M8");

        expect(cart.services.picking.read().cents).toBe(140);

        await app.stop();
    });

    /**
     * The refusal crosses two boundaries: the catalog runs its hook, the cart
     * answers it, and the part stays where it is. Nothing here imports the
     * other.
     */
    test("and stop a part leaving the shelves while a pick list holds it", async () =>
    {
        const app = await mount(new QueryClient());

        const cart = app.kernel.context("cart") as {
            services: { picking: { add: (id: string, name: string) => Promise<void> } };
        };

        const catalog = app.kernel.context("catalog") as {
            services: { parts: { withdraw: (id: string) => Promise<void>; get: (id: string) => Promise<unknown> } };
        };

        await cart.services.picking.add(bolt, "Hex bolt M8");

        await expect(catalog.services.parts.withdraw(bolt)).rejects.toThrow(/on a pick list/);

        await expect(catalog.services.parts.get(bolt)).resolves.toBeDefined();

        await app.stop();
    });

    test("but let one nobody holds go, and strike it off wherever it was", async () =>
    {
        const app = await mount(new QueryClient());
        const seal = "5f1a0a3e-1c2b-4f0a-9a11-000000000004";

        const cart = app.kernel.context("cart") as {
            services: {
                picking: {
                    add: (id: string, name: string) => Promise<void>;
                    read: () => { lines: { partId: string; gone: boolean }[] };
                };
            };
        };

        const catalog = app.kernel.context("catalog") as {
            services: { parts: { withdraw: (id: string) => Promise<void> } };
        };

        await cart.services.picking.add(bolt, "Hex bolt M8");
        await catalog.services.parts.withdraw(seal);

        expect(cart.services.picking.read().lines.find((one) => one.partId === bolt)?.gone).toBe(false);

        await app.stop();
    });
});
