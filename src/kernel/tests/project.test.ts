import { expect, test } from "vitest";

import { Project } from "@onetype/stack-app-kit/testing";

test("the project holds to every rule the kit checks, including ones added after this was written", () =>
{
    expect(Project.checks().map((problem) => `[${problem.check}] ${problem.message}`)).toEqual([]);
});
