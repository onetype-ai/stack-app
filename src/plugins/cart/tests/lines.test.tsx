import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { PickedLines } from "../sections/PickedLines/PickedLines";

import type { PickList } from "../types/PickList";

const bolt = "5f1a0a3e-1c2b-4f0a-9a11-000000000001";

const carrying = (lines: PickList["lines"]): PickList =>
{
    const live = lines.filter((line) => !line.gone);

    return {
        lines,
        cents: live.reduce((sum, line) => sum + line.cents * line.quantity, 0),
        items: live.reduce((sum, line) => sum + line.quantity, 0),
    };
};

describe("a pick list on screen", () =>
{
    test("says what is not there rather than showing an empty box", () =>
    {
        render(<PickedLines list={carrying([])} currency="EUR" />);

        expect(screen.getByText("Nothing picked yet")).toBeDefined();
    });

    test("shows a line, what it costs each, and what the line comes to", () =>
    {
        render(
            <PickedLines
                list={carrying([{ partId: bolt, name: "Hex bolt M8", cents: 140, quantity: 3, gone: false }])}
                currency="EUR"
            />,
        );

        expect(screen.getByText("Hex bolt M8")).toBeDefined();
        expect(screen.getByText(/1[.,]40 each/)).toBeDefined();
        expect(screen.getByText("x3")).toBeDefined();
        expect(screen.getAllByText(/4[.,]20/)).toHaveLength(2);
        expect(screen.getByText("3 items")).toBeDefined();
    });

    /**
     * A struck line stays on screen so the reader knows why the total moved,
     * and carries no price, because nobody can be charged for it.
     */
    test("keeps a line whose part left the shelves, and stops counting it", () =>
    {
        render(
            <PickedLines
                list={carrying([{ partId: bolt, name: "Hex bolt M8", cents: 140, quantity: 3, gone: true }])}
                currency="EUR"
            />,
        );

        expect(screen.getByText("Hex bolt M8")).toBeDefined();
        expect(screen.getByText("Off the shelves")).toBeDefined();
        expect(screen.getByText("0 items")).toBeDefined();
    });

    test("names what a remove button removes, so a reader hears which line", () =>
    {
        render(
            <PickedLines
                list={carrying([{ partId: bolt, name: "Hex bolt M8", cents: 140, quantity: 1, gone: false }])}
                currency="EUR"
                onDrop={() => undefined}
            />,
        );

        expect(screen.getByRole("button", { name: "Take Hex bolt M8 off the list" })).toBeDefined();
    });

    test("and removes it by keyboard alone", async () =>
    {
        const dropped = vi.fn();

        render(
            <PickedLines
                list={carrying([{ partId: bolt, name: "Hex bolt M8", cents: 140, quantity: 1, gone: false }])}
                currency="EUR"
                onDrop={dropped}
            />,
        );

        await userEvent.tab();
        await userEvent.keyboard("{Enter}");

        expect(dropped).toHaveBeenCalledWith(bolt);
    });

    test("but offers no remove at all when nothing above it can act on one", () =>
    {
        render(
            <PickedLines
                list={carrying([{ partId: bolt, name: "Hex bolt M8", cents: 140, quantity: 1, gone: false }])}
                currency="EUR"
            />,
        );

        expect(screen.queryByRole("button")).toBeNull();
    });
});
