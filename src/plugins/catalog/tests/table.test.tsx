import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { PartTable } from "../sections/PartTable/PartTable";

import type { Part } from "../types/Part";

const bolt: Part = {
    id: "5f1a0a3e-1c2b-4f0a-9a11-000000000001",
    name: "Hex bolt M8",
    kind: "fastener",
    cents: 140,
    stock: 220,
};

const thrust: Part = {
    id: "5f1a0a3e-1c2b-4f0a-9a11-000000000009",
    name: "Thrust bearing 51105",
    kind: "bearing",
    cents: 3180,
    stock: 0,
};

const showing = (held: Partial<Parameters<typeof PartTable>[0]> = {}) =>
{
    return render(
        <PartTable
            parts={[bolt]}
            currency="EUR"
            lowStock={20}
            loading={false}
            onKind={() => undefined}
            onOpen={() => undefined}
            {...held}
        />,
    );
};

describe("the shelves on screen", () =>
{
    test("say they are busy while they are, and show no rows", () =>
    {
        showing({ parts: [], loading: true });

        expect(screen.getByRole("region", { name: "Stocked parts" })).toHaveAttribute("aria-busy", "true");
        expect(screen.queryByRole("listitem")).toBeNull();
    });

    test("say what is missing rather than showing an empty box", () =>
    {
        showing({ parts: [] });

        expect(screen.getByText("Nothing stocked here")).toBeDefined();
    });

    test("and say it differently when a kind was chosen, so the filter is the suspect", () =>
    {
        showing({ parts: [], kind: "seal" });

        expect(screen.getByText("No part of that kind is stocked.")).toBeDefined();
    });

    test("show a part's name and its price in the reader's money", () =>
    {
        showing();

        expect(screen.getByText("Hex bolt M8")).toBeDefined();
        expect(screen.getByText(/1[.,]40/)).toBeDefined();
    });

    /**
     * A part with none left still has a price, and a reader who cannot see
     * that it is out of stock puts it on a list nobody can pull.
     */
    test("and say when a part has none left", () =>
    {
        showing({ parts: [thrust] });

        expect(screen.getByText("Out of stock")).toBeDefined();
    });
});

describe("choosing a kind", () =>
{
    test("tells the page, which is what puts it in the address", async () =>
    {
        const chosen = vi.fn();

        showing({ onKind: chosen });

        await userEvent.selectOptions(screen.getByLabelText("Kind"), "seal");

        expect(chosen).toHaveBeenCalledWith("seal");
    });

    test("and says nothing was chosen when the placeholder is picked back", async () =>
    {
        const chosen = vi.fn();

        showing({ kind: "seal", onKind: chosen });

        await userEvent.selectOptions(screen.getByLabelText("Kind"), "");

        expect(chosen).toHaveBeenCalledWith(undefined);
    });
});

describe("opening a part", () =>
{
    test("happens by keyboard alone, without the browser following the link", async () =>
    {
        const opened = vi.fn();

        showing({ onOpen: opened });

        await userEvent.tab();
        await userEvent.tab();
        await userEvent.keyboard("{Enter}");

        expect(opened).toHaveBeenCalledWith(bolt.id);
    });

    /**
     * A middle of a new tab must still work: a router taking over every click
     * is how an application loses "open in a new tab".
     */
    test("but leaves a held modifier to the browser", () =>
    {
        const opened = vi.fn();

        showing({ onOpen: opened });

        fireEvent.click(screen.getByRole("link", { name: "Hex bolt M8" }), { metaKey: true });

        expect(opened).not.toHaveBeenCalled();
    });
});
