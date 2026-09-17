import { QueryClient } from "@tanstack/react-query";
import { describe, expect, test } from "vitest";

import { Mount } from "../index";

describe("this application, booted the way it ships rather than from plugins a test wrote", () =>
{
    test("starts with the plugins it ships, and carries the router they declared", async () =>
    {
        const app = await Mount.open(new QueryClient());

        expect(app.kernel.started()).toBe(true);
        expect(app.router).toBeDefined();

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
