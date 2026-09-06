import { QueryClient } from "@tanstack/react-query";
import { describe, expect, test } from "vitest";

import { Mount, Routes } from "../index";

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
        const app = await Mount.open(new QueryClient());

        expect(app.kernel.started()).toBe(true);

        await app.stop();
    });

    /**
     * Whatever ships, no two plugins may claim one path. With the examples
     * packed away there is nothing to collide, and that is still the answer.
     */
    test("registers each declared page once, and never a path twice", async () =>
    {
        const app = await Mount.open(new QueryClient());
        const paths = app.kernel.routes().map((route) => route.path);

        expect(new Set(paths).size).toBe(paths.length);

        await app.stop();
    });

    test("and every route names the plugin that declared it", async () =>
    {
        const app = await Mount.open(new QueryClient());

        for (const route of app.kernel.routes())
        {
            expect(route.plugin).toBeTruthy();
            expect(route.path.startsWith("/")).toBe(true);
        }

        await app.stop();
    });

    /**
     * A router needs a shell to render pages into, and nothing else here
     * would say so: the failure reaches a blank screen rather than a test.
     * Which answer is right depends on whether a plugin ships a frame.
     */
    test("builds a router when a plugin frames it, and says so when none does", async () =>
    {
        const app = await Mount.open(new QueryClient());

        if (app.kernel.frame() === undefined)
        {
            expect(() => Routes.build(app.kernel)).toThrow(/frame/);
        }
        else
        {
            expect(() => Routes.build(app.kernel)).not.toThrow();
        }

        await app.stop();
    });

    /**
     * A guarded route asks the kernel, so a kernel that granted nothing turns
     * every one of them into a blanket 403 with no error anywhere.
     */
    test("carries the permissions its plugins granted, and only those", async () =>
    {
        const app = await Mount.open(new QueryClient());

        /* Whatever ships was declared, so every requirement is answerable. */
        const required = app.kernel.routes().flatMap((route) => route.requires ?? []);

        expect(app.kernel.permissions.all(required)).toBe(true);
        expect(app.kernel.permissions.has("nobody.granted.this")).toBe(false);

        await app.stop();
    });

    test("closes what it opened, so a second start is a fresh one", async () =>
    {
        const first = await Mount.open(new QueryClient());

        await first.stop();

        expect(first.kernel.started()).toBe(false);

        const second = await Mount.open(new QueryClient());

        expect(second.kernel.started()).toBe(true);

        await second.stop();
    });
});

describe("a start the kernel refuses", () =>
{
    /**
     * The message names the plugin, the key and the fix, and reaches nobody
     * unless the entry catches it. `main.tsx` does; this is what says so.
     */
    test("throws a message naming the plugin and what to do", async () =>
    {
        const { createKernel, definePlugin } = await import("@onetype/stack-app-kit");

        const wrong = definePlugin("billing", {
            version: "1.0.0",
            describe: "Depends on nothing that exists.",
            dependsOn: ["nowhere"],
        });

        const kernel = createKernel({ plugins: [wrong] });

        await expect(kernel.start()).rejects.toThrow(/billing/);
        await expect(kernel.start()).rejects.toThrow(/nowhere/);
    });

    test("and says so before anything started, so nothing is half up", async () =>
    {
        const { createKernel, definePlugin } = await import("@onetype/stack-app-kit");

        const kernel = createKernel({
            plugins: [definePlugin("bad", { version: "1.0.0", describe: "x", dependsOn: ["gone"] })],
        });

        await expect(kernel.start()).rejects.toThrow();
        expect(kernel.started()).toBe(false);
    });
});
