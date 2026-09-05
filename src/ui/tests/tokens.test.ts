import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/** Every `var(--name)` under a directory, whatever it is nested in. */
function asked(at: string): Set<string>
{
    const found = new Set<string>();

    const walk = (path: string): void =>
    {
        for (const entry of readdirSync(path))
        {
            const one = join(path, entry);

            if (statSync(one).isDirectory())
            {
                walk(one);
            }
            else if (one.endsWith(".css"))
            {
                for (const match of readFileSync(one, "utf8").matchAll(/var\((--[a-z0-9-]+)/g))
                {
                    found.add(match[1] ?? "");
                }
            }
        }
    };

    walk(at);

    return found;
}

const declared = new Set(
    [...readFileSync("src/ui/styles/tokens.css", "utf8").matchAll(/^\s+(--[a-z0-9-]+):/gm)]
        .map((match) => match[1] ?? ""),
);

/**
 * A token nobody declared is not an error anywhere: CSS resolves it to
 * nothing and the rule silently does not apply. Eleven stylesheets were
 * written against names that did not exist, and everything still built.
 */
describe("every token a stylesheet asks for", () =>
{
    test("is declared, in the plugins", () =>
    {
        expect([...asked("src/plugins")].filter((one) => !declared.has(one))).toEqual([]);
    });

    test("and in ui itself", () =>
    {
        const own = [...asked("src/ui")].filter((one) => !declared.has(one));

        expect(own).toEqual([]);
    });
});
