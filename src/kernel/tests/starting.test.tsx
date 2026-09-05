import { QueryClient } from "@tanstack/react-query";
import { describe, expect, test } from "vitest";

import { mount, routes } from "../index";

/**
 * The one case that boots what ships, rather than a plugin a test wrote.
 *
 * A contract this application declares wrongly fails here and nowhere else:
 * every other test builds its own plugins, so none of them reads `plugins/`.
 */
describe("this application", () =>
{
    test("starts with the plugins it ships, or says which one refused", async () =>
    {
        const app = await mount(new QueryClient());

        expect(app.kernel.started()).toBe(true);

        await app.stop();
    });

    test("registers a route for every page a plugin declared", async () =>
    {
        const app = await mount(new QueryClient());
        const paths = app.kernel.routes().map((one) => one.path);

        expect(paths.length).toBeGreaterThan(0);
        expect(new Set(paths).size).toBe(paths.length);

        await app.stop();
    });

    test("and every route names the plugin that declared it", async () =>
    {
        const app = await mount(new QueryClient());

        for (const route of app.kernel.routes())
        {
            expect(route.plugin).toBeTruthy();
            expect(route.path.startsWith("/")).toBe(true);
        }

        await app.stop();
    });

    /**
     * `routes` throws without a frame, and nothing else here would say so:
     * the failure reaches a blank screen rather than a test.
     */
    test("builds a router from them, which needs a frame to exist", async () =>
    {
        const app = await mount(new QueryClient());

        expect(() => routes(app.kernel)).not.toThrow();

        await app.stop();
    });

    test("closes what it opened, so a second start is a fresh one", async () =>
    {
        const first = await mount(new QueryClient());

        await first.stop();

        expect(first.kernel.started()).toBe(false);

        const second = await mount(new QueryClient());

        expect(second.kernel.started()).toBe(true);

        await second.stop();
    });
});
