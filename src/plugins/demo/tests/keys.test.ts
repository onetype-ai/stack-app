import { describe, expect, test } from "vitest";

import { DemoKeys } from "../utils/DemoKeys";

/**
 * A cache key is what decides whether two requests are the same question.
 * Two that differ but share a key answer each other's data.
 */
describe("a cache key", () =>
{
    test("starts with the plugin, so one plugin never invalidates another's", () =>
    {
        expect(DemoKeys.items()[0]).toBe("demo");
        expect(DemoKeys.item("a")[0]).toBe("demo");
        expect(DemoKeys.itemList({}, 20)[0]).toBe("demo");
    });

    test("tells one item from another", () =>
    {
        expect(DemoKeys.item("a")).not.toEqual(DemoKeys.item("b"));
    });

    test("and one page size from another, because the answer differs", () =>
    {
        expect(DemoKeys.itemList({}, 20)).not.toEqual(DemoKeys.itemList({}, 50));
    });

    test("counts the query, so a filtered list is not served the unfiltered one", () =>
    {
        expect(DemoKeys.itemList({ status: "active" }, 20))
            .not.toEqual(DemoKeys.itemList({ status: "archived" }, 20));
    });

    test("but answers the same key for the same question, or nothing is ever a hit", () =>
    {
        expect(DemoKeys.itemList({ status: "active" }, 20))
            .toEqual(DemoKeys.itemList({ status: "active" }, 20));
    });

    test("and a list key sits under the items key, so invalidating items clears it", () =>
    {
        expect(DemoKeys.itemList({}, 20).slice(0, 2)).toEqual([...DemoKeys.items()]);
        expect(DemoKeys.item("a").slice(0, 2)).toEqual([...DemoKeys.items()]);
    });
});
