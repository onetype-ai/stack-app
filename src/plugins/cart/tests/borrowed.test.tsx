import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { createKernel } from "@onetype/stack-app-kit";
import { KernelProvider } from "@onetype/stack-app-kit/react";

import cart from "../plugin";
import { PickedParts } from "../sections/PickedParts/PickedParts";
import { depot } from "./depot";

import type { Kernel } from "@onetype/stack-app-kit";
import type { Part } from "@plugins/catalog";
import type { ReactNode } from "react";

const bolt: Part = {
    id: "5f1a0a3e-1c2b-4f0a-9a11-000000000001",
    name: "Hex bolt M8",
    kind: "fastener",
    cents: 140,
    stock: 220,
};

const serving = async (answer: (id: string) => Promise<Part>): Promise<Kernel> =>
{
    const kernel = createKernel({ plugins: [depot({ get: answer }), cart] });

    await kernel.start();

    return kernel;
};

const showing = (kernel: Kernel, ids: readonly string[]): ReactNode =>
{
    return (
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            <KernelProvider kernel={kernel}>
                <PickedParts partIds={ids} />
            </KernelProvider>
        </QueryClientProvider>
    );
};

/**
 * The row is the catalog's own component. A cart that drew its own would drift
 * from what the depot shows, and the two screens would disagree about a part.
 */
describe("a line shown as the depot holds it", () =>
{
    test("asks the catalog for the part, by number and nothing else", async () =>
    {
        const asked: string[] = [];

        const kernel = await serving((id) =>
        {
            asked.push(id);

            return Promise.resolve(bolt);
        });

        render(showing(kernel, [bolt.id]));

        expect(await screen.findByText("Hex bolt M8")).toBeDefined();
        expect(asked).toEqual([bolt.id]);

        await kernel.stop();
    });

    test("and draws it with the catalog's own row, price and stock included", async () =>
    {
        const kernel = await serving(() => Promise.resolve(bolt));

        render(showing(kernel, [bolt.id]));

        expect(await screen.findByText("Fasteners")).toBeDefined();
        expect(screen.getByText(/1[.,]40/)).toBeDefined();
        expect(screen.getByText("220 in stock")).toBeDefined();

        await kernel.stop();
    });

    test("shows nothing but the waiting shape until every part has answered", async () =>
    {
        const kernel = await serving(() => new Promise<Part>(() => undefined));

        render(showing(kernel, [bolt.id]));

        expect(screen.queryByRole("listitem")).toBeNull();
        expect(screen.getByRole("region", { name: "Each line as the depot holds it" })).toBeDefined();

        await kernel.stop();
    });

    test("and leaves out a part the catalog could not answer for, rather than a blank row", async () =>
    {
        const kernel = await serving((id) =>
        {
            return id === bolt.id
                ? Promise.resolve(bolt)
                : Promise.reject(new Error("No part carries that number."));
        });

        render(showing(kernel, [bolt.id, "5f1a0a3e-1c2b-4f0a-9a11-000000000999"]));

        expect(await screen.findByText("Hex bolt M8")).toBeDefined();
        expect(screen.getAllByRole("listitem")).toHaveLength(1);

        await kernel.stop();
    });
});
