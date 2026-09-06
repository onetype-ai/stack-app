import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { createKernel } from "@onetype/stack-app-kit";
import { KernelProvider, Slot } from "@onetype/stack-app-kit/react";

import cart from "../plugin";
import { fakeCatalog } from "./fake-catalog";

import type { Kernel } from "@onetype/stack-app-kit";
import type { ReactNode } from "react";

const bolt = "5f1a0a3e-1c2b-4f0a-9a11-000000000001";

const serving = async (granting?: readonly string[]): Promise<Kernel> =>
{
    const kernel = createKernel({
        plugins: [fakeCatalog(granting === undefined ? {} : { granting }), cart],
    });

    await kernel.start();

    return kernel;
};

const showing = (kernel: Kernel): ReactNode =>
{
    return (
        <KernelProvider kernel={kernel}>
            <Slot name="catalog.part.aside" payload={{ id: bolt, name: "Hex bolt M8", cents: 140 }} />
        </KernelProvider>
    );
};

describe("what the cart puts beside a part", () =>
{
    test("offers to add it, without the catalog importing the cart to say so", async () =>
    {
        const kernel = await serving();

        render(showing(kernel));

        expect(screen.getByRole("button", { name: "Add to pick list" })).toBeDefined();

        await kernel.stop();
    });

    /**
     * `useStore` is what makes this move. Reading the list once at render
     * would leave the badge behind the moment anything changed it.
     */
    test("and says how many are on the list once one is", async () =>
    {
        const kernel = await serving();

        render(showing(kernel));

        await userEvent.click(screen.getByRole("button", { name: "Add to pick list" }));

        expect(screen.getByText("1 on the list")).toBeDefined();

        await userEvent.click(screen.getByRole("button", { name: "Add another" }));

        expect(screen.getByText("2 on the list")).toBeDefined();

        await kernel.stop();
    });

    /**
     * The listener strikes the line wherever it is. This is the other half:
     * the reader looking at that part is told, rather than clicking a button
     * for a part that is already gone.
     */
    test("and stops offering once that part leaves the shelves while it is on screen", async () =>
    {
        const kernel = await serving();

        render(showing(kernel));

        expect(screen.getByRole("button", { name: "Add to pick list" })).not.toBeDisabled();

        kernel.context("catalog").events.emit("catalog.part.withdrawn", { id: bolt, name: "Hex bolt M8" });

        expect(await screen.findByRole("status")).toHaveTextContent(/left the shelves/);
        expect(screen.getByRole("button", { name: "Add to pick list" })).toBeDisabled();

        await kernel.stop();
    });

    test("but pays no attention to a different part leaving", async () =>
    {
        const kernel = await serving();

        render(showing(kernel));

        kernel.context("catalog").events.emit("catalog.part.withdrawn", {
            id: "5f1a0a3e-1c2b-4f0a-9a11-000000000004",
            name: "O ring 12mm",
        });

        expect(screen.queryByRole("status")).toBeNull();
        expect(screen.getByRole("button", { name: "Add to pick list" })).not.toBeDisabled();

        await kernel.stop();
    });
});

describe("a contribution the viewer may not make", () =>
{
    test("is not rendered at all, because the slot filters by what it requires", async () =>
    {
        const kernel = await serving(["catalog.read"]);

        render(showing(kernel));

        expect(screen.queryByRole("button", { name: "Add to pick list" })).toBeNull();

        await kernel.stop();
    });
});
