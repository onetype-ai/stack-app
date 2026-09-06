import { describe, expect, test } from "vitest";

import { Money } from "../Money";

describe("a price on screen", () =>
{
    /* The space before € is U+00A0, which is what Intl emits and what keeps a
       price from wrapping onto two lines. Writing a plain space here would
       pass nowhere and read as a broken test. */
    test("is the currency's own shape, in the reader's language", () =>
    {
        expect(Money.format(140, "EUR", "de-DE")).toBe("1,40\u00A0€");
        expect(Money.format(140, "EUR", "en-IE")).toBe("€1.40");
    });

    /* Money is an integer everywhere: cents divided at the edge, never a
       float carried through the app, so 0.1 + 0.2 never reaches a total. */
    test("divides the integer it was given, and keeps the cents", () =>
    {
        expect(Money.format(3180, "USD", "en-US")).toBe("$31.80");
        expect(Money.format(5, "USD", "en-US")).toBe("$0.05");
        expect(Money.format(0, "USD", "en-US")).toBe("$0.00");
    });

    test("and a currency with no minor unit is not given two decimals", () =>
    {
        expect(Money.format(50000, "JPY", "ja-JP")).toBe("￥500");
    });

    /* A NaN reaching Intl renders "NaN" beside a product name, which reads as
       a broken page rather than a missing price. */
    test("says nothing at all rather than showing NaN", () =>
    {
        expect(Money.format(Number.NaN, "EUR", "de-DE")).toBe("");
        expect(Money.format(Number.POSITIVE_INFINITY, "EUR", "de-DE")).toBe("");
    });
});
