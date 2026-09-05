import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { useChosenKind } from "../hooks/useChosenKind";
import { PartQuery } from "../types/PartQuery";

import type { ReactNode } from "react";

const Reading = (): ReactNode =>
{
    const chosen = useChosenKind();

    return (
        <div>
            <p>{chosen.kind ?? "everything"}</p>
            <button type="button" onClick={() => { chosen.choose("seal"); }}>Show seals</button>
            <button type="button" onClick={() => { chosen.choose(undefined); }}>Show everything</button>
        </div>
    );
};

const at = (address: string): ReactNode =>
{
    const root = createRootRoute();

    const page = createRoute({
        getParentRoute: () => root,
        path: "/catalog",
        component: Reading,
        validateSearch: (raw: Record<string, unknown>): unknown => PartQuery.schema.parse(raw),
    });

    const router = createRouter({
        routeTree: root.addChildren([page]),
        history: createMemoryHistory({ initialEntries: [address] }),
    });

    return <RouterProvider router={router as never} />;
};

/**
 * The address is the state. A filter kept in a component is one a link cannot
 * carry and a reload throws away.
 */
describe("which kind the reader is looking at", () =>
{
    test("is whatever the address says", async () =>
    {
        render(at("/catalog?kind=bearing"));

        expect(await screen.findByText("bearing")).toBeDefined();
    });

    test("and is everything when the address says nothing", async () =>
    {
        render(at("/catalog"));

        expect(await screen.findByText("everything")).toBeDefined();
    });

    test("moves into the address when the reader chooses one", async () =>
    {
        render(at("/catalog"));

        await userEvent.click(await screen.findByRole("button", { name: "Show seals" }));

        expect(await screen.findByText("seal")).toBeDefined();
    });

    test("and leaves it again when they choose everything", async () =>
    {
        render(at("/catalog?kind=seal"));

        await userEvent.click(await screen.findByRole("button", { name: "Show everything" }));

        expect(await screen.findByText("everything")).toBeDefined();
    });
});
