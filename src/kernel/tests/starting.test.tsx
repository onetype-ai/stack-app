import { QueryClient } from "@tanstack/react-query";
import { describe, expect, test } from "vitest";

import { Mount, Routes } from "../index";

describe("this application, booted the way it ships rather than from plugins a test wrote", () =>
{
    test("starts with the plugins it ships, or says which one refused", async () =>
    {
        const app = await Mount.open(new QueryClient());

        expect(app.kernel.started()).toBe(true);

        await app.stop();
    });

    test("registers each declared page once, and never a path twice, whatever ships", async () =>
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

    test("builds a router when a plugin frames it, and refuses naming the frame when none does", async () =>
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

    test("requires only permissions some plugin declares, so no guard asks for what nothing grants", async () =>
    {
        const { discover } = await import("@onetype/stack-app-kit");

        const plugins = discover(import.meta.glob("../../plugins/*/plugin.ts", { eager: true }));
        const declared = plugins.flatMap((one) => Object.keys(one.definition.permissions ?? {}));

        const app = await Mount.open(new QueryClient());

        for (const route of app.kernel.routes())
        {
            for (const permission of route.requires ?? [])
            {
                expect(declared).toContain(permission);
            }
        }

        await app.stop();
    });

    test("and grants nothing at all until a server says who is reading", async () =>
    {
        const app = await Mount.open(new QueryClient());

        expect(app.kernel.permissions.has("documents.read")).toBe(false);

        await app.stop();
    });

    test("and grants nothing nobody declared", async () =>
    {
        const app = await Mount.open(new QueryClient());

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
    test("throws a message naming the plugin and the dependency, for main.tsx to show", async () =>
    {
        const { createKernel, definePlugin } = await import("@onetype/stack-app-kit");

        const missingDependency = definePlugin("billing", {
            version: "1.0.0",
            describe: "Depends on nothing that exists.",
            dependsOn: ["nowhere"],
        });

        const kernel = createKernel({ plugins: [missingDependency] });

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

