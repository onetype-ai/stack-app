import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

import { Project } from "@onetype/stack-app-kit/testing";

const declaredName = (): string =>
{
    const folder = join(process.cwd(), "node_modules", "@onetype", "stack-app-kit", "dist");

    for (const name of readdirSync(folder).filter((file) => file.endsWith(".d.ts")))
    {
        const source = readFileSync(join(folder, name), "utf8");

        if (/type Definition[\s\S]*?\n\};/.test(source))
        {
            return source;
        }
    }

    throw new Error("No published type declares Definition, so nothing would be checked.");
};

test("the project holds to every rule the kit checks, including ones added after this was written", () =>
{
    const problems = Project.findAll({ contract: declaredName(), worked: ["2c2.notes.md"] })
        .map((problem) => `[${problem.check}] ${problem.message}`);

    expect(problems).toEqual([]);
});
