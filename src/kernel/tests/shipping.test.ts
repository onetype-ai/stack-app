import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const root = process.cwd();

const shippedAndNotIgnored = (path: string): boolean =>
{
    if (!existsSync(join(root, path)))
    {
        return false;
    }

    if (!existsSync(join(root, ".git")))
    {
        return true;
    }

    return execSync(`git check-ignore ${path} || true`, { cwd: root, encoding: "utf8" }).trim() === "";
};

describe("what a fresh clone gets", () =>
{
    test("carries the tool the documents tell it to run", () =>
    {
        expect(shippedAndNotIgnored("tools/pack")).toBe(true);
    });

    test("and its composition root imports nothing an example folded away", () =>
    {
        const entry = readFileSync(join(root, "src", "main.tsx"), "utf8");

        for (const [, path] of entry.matchAll(/^import\s+"([^"]+)";$/gm))
        {
            const asked = path ?? "";

            expect(asked.startsWith("@ui/")).toBe(false);
            expect(asked.startsWith("@plugins/")).toBe(false);
            expect(asked.startsWith("@utils/")).toBe(false);
        }
    });

    test("and nothing outside the examples reaches into one", () =>
    {
        const outside = execSync(
            `find src/kernel -maxdepth 1 -name '*.ts' -o -maxdepth 1 -name '*.tsx'; echo src/main.tsx`,
            { cwd: root, encoding: "utf8" },
        ).trim().split("\n").filter(Boolean);

        for (const file of outside)
        {
            const source = readFileSync(join(root, file), "utf8");

            expect(source).not.toMatch(/from "@plugins\//);
            expect(source).not.toMatch(/from "@utils\//);
        }
    });

    test("and every folder the entry needs is present whether the examples are folded or not", () =>
    {
        for (const folder of ["src/plugins", "src/ui", "src/utils"])
        {
            expect(existsSync(join(root, folder))).toBe(true);
        }
    });
});
