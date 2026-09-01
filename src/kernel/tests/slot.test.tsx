import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { z } from "zod";

import { createKernel, definePlugin } from "@onetype/stack-app-kit";
import { KernelProvider, Slot } from "@onetype/stack-app-kit/react";

test("a Slot from the kit renders inside the app's React", async () =>
{
    const shell = definePlugin("shell", {
        version: "1.0.0",
        describe: "Opens a slot.",
        slots: { "shell.side": { describe: "beside", schema: z.object({}) } },
    });

    const kernel = createKernel({ plugins: [shell] });

    await kernel.start();

    render(
        <KernelProvider kernel={kernel}>
            <Slot name="shell.side" />
        </KernelProvider>,
    );

    expect(document.body).toBeDefined();
});
