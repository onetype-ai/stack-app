import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Badge, Button, Empty, Field, Modal, Select, Skeleton, Spinner } from "../index";

describe("Button", () =>
{
    test("is a button, not a div, so a keyboard reaches it", () =>
    {
        render(<Button>Save</Button>);

        expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
    });

    test("does not submit a form it happens to sit in", () =>
    {
        render(<Button>Save</Button>);

        expect(screen.getByRole("button").getAttribute("type")).toBe("button");
    });

    /** A second click while the first is still running is the bug this stops. */
    test("cannot be pressed while it is busy, and says it is", () =>
    {
        const pressed = vi.fn();

        render(<Button busy onClick={pressed}>Save</Button>);

        const button = screen.getByRole("button");

        expect(button.hasAttribute("disabled")).toBe(true);
        expect(button.getAttribute("aria-busy")).toBe("true");
    });
});

describe("Field", () =>
{
    test("ties its label to its input, so clicking the label focuses it", async () =>
    {
        render(<Field label="Email" />);

        await userEvent.click(screen.getByText("Email"));

        expect(document.activeElement).toBe(screen.getByRole("textbox"));
    });

    /**
     * A red border is not an error to somebody who cannot see it: the text is
     * tied by `aria-describedby` and announced by `role="alert"`.
     */
    test("says what is wrong where a screen reader will find it", () =>
    {
        render(<Field label="Email" wrong="Enter an address we can reach." />);

        const input = screen.getByRole("textbox");

        expect(input.getAttribute("aria-invalid")).toBe("true");
        expect(input.getAttribute("aria-describedby")).toContain("wrong");
        expect(screen.getByRole("alert").textContent).toBe("Enter an address we can reach.");
    });

    test("and carries the hint too, without losing the error", () =>
    {
        render(<Field label="Email" hint="Work address." wrong="Required." />);

        const said = screen.getByRole("textbox").getAttribute("aria-describedby") ?? "";

        expect(said.split(" ").length).toBe(2);
    });
});

describe("Select", () =>
{
    test("offers what it was given, and a placeholder that is not a value", () =>
    {
        render(<Select label="Status" placeholder="Any" choices={[{ value: "open", label: "Open" }]} />);

        expect(screen.getByRole("option", { name: "Any" }).getAttribute("value")).toBe("");
        expect(screen.getByRole("option", { name: "Open" })).toBeDefined();
    });
});

describe("Modal", () =>
{
    test("renders nothing at all when closed", () =>
    {
        render(<Modal open={false} title="Confirm" onClose={() => {}}>Body</Modal>);

        expect(screen.queryByRole("dialog")).toBeNull();
    });

    test("is a dialog that names itself by its own heading", () =>
    {
        render(<Modal open title="Confirm" onClose={() => {}}>Body</Modal>);

        expect(screen.getByRole("dialog", { name: "Confirm" })).toBeDefined();
    });

    test("closes on escape, so it is never a trap", async () =>
    {
        const closed = vi.fn();

        render(<Modal open title="Confirm" onClose={closed}>Body</Modal>);

        await userEvent.keyboard("{Escape}");

        expect(closed).toHaveBeenCalled();
    });
});

describe("the quiet ones", () =>
{
    test("Empty says what is missing, and Badge what it is", () =>
    {
        render(<><Empty title="No messages" hint="Nothing has arrived." /><Badge tone="danger">Overdue</Badge></>);

        expect(screen.getByText("No messages")).toBeDefined();
        expect(screen.getByText("Overdue")).toBeDefined();
    });

    test("Spinner is heard, Skeleton is not", () =>
    {
        const { container } = render(<><Spinner label="Loading messages" /><Skeleton lines={3} /></>);

        expect(screen.getByRole("status", { name: "Loading messages" })).toBeDefined();
        expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
    });
});
