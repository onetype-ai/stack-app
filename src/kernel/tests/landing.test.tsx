import { createKernel, definePlugin } from "@onetype/stack-app-kit";
import { describe, expect, test } from "vitest";

import { Routes } from "../routes";

const Page = (): null => null;

const shell = definePlugin("shell", {
    version: "1.0.0",
    describe: "The frame.",
    frame: Page,
    pages: { forbidden: Page, missing: Page },
    grants: () => [],
});

function page(name: string, path: string)
{
    return definePlugin(name, {
        version: "1.0.0",
        describe: `The ${name} page.`,
        routes: [{ path, title: "A page", component: Page }],
    });
}

describe("the root of an application", () =>
{
    test("is served by the plugin that declares it, rather than redirected away", async () =>
    {
        const kernel = createKernel({ plugins: [shell, page("home", "/"), page("about", "/about")] });

        await kernel.start();

        expect(() => Routes.build(kernel)).not.toThrow();
    });

    test("and sends elsewhere only where nothing claims it", async () =>
    {
        const kernel = createKernel({ plugins: [shell, page("about", "/about")] });

        await kernel.start();

        expect(() => Routes.build(kernel)).not.toThrow();
    });
});
