import { describe, expect, test } from "vitest";

describe("what a test may keep between renders", () =>
{
    test("localStorage answers what was written to it", () =>
    {
        window.localStorage.setItem("theme", "dark");

        expect(window.localStorage.getItem("theme")).toBe("dark");
    });

    test("and nothing a previous test left behind", () =>
    {
        expect(window.localStorage.getItem("theme")).toBeNull();
    });

    test("while removing one leaves the rest", () =>
    {
        window.localStorage.setItem("theme", "dark");
        window.localStorage.setItem("side", "wide");
        window.localStorage.removeItem("theme");

        expect(window.localStorage.getItem("theme")).toBeNull();
        expect(window.localStorage.getItem("side")).toBe("wide");
    });
});
