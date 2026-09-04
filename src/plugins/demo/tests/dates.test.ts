import { describe, expect, test } from "vitest";

import { Dates } from "../utils/Dates";

describe("a date shown to a reader", () =>
{
    test("is written the way their language writes one", () =>
    {
        expect(Dates.absolute("2026-03-14T09:05:00Z", "en-GB")).toContain("2026");
        expect(Dates.absolute("2026-03-14T09:05:00Z", "en-GB")).not.toBe("");
    });

    /**
     * A server that answers something unparseable is not a reason to put an
     * exception on the screen: the field goes empty and the page still renders.
     */
    test("and is empty rather than broken when the string is not a date", () =>
    {
        expect(Dates.absolute("not a date")).toBe("");
        expect(Dates.relative("not a date")).toBe("");
        expect(Dates.absolute("")).toBe("");
    });
});

describe("how long ago something was", () =>
{
    const now = new Date("2026-03-14T12:00:00Z");

    test("counts in the largest unit that fits", () =>
    {
        expect(Dates.relative("2026-03-14T11:00:00Z", now, "en")).toBe("1 hour ago");
        expect(Dates.relative("2026-03-13T12:00:00Z", now, "en")).toBe("yesterday");
        expect(Dates.relative("2025-03-14T12:00:00Z", now, "en")).toBe("last year");
    });

    test("and says which way, so a future moment is not read as a past one", () =>
    {
        expect(Dates.relative("2026-03-14T13:00:00Z", now, "en")).toBe("in 1 hour");
    });

    test("with anything under a minute called now, never zero minutes ago", () =>
    {
        expect(Dates.relative("2026-03-14T11:59:30Z", now, "en")).toBe("this minute");
    });
});
