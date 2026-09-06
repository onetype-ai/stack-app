import { expect, test } from "vitest";

import { Project } from "@onetype/stack-app-kit/testing";

/**
 * Every check the kit ships, in one call.
 *
 * One entry rather than one test per check: a check the kit adds reaches this
 * project the moment it is installed, instead of waiting for someone to
 * notice it exists. Two of them had been missing here for exactly that
 * reason, and both were finding real defects the day they were wired up.
 */
test("the project holds to every rule the kit checks", () =>
{
    expect(Project.checks().map((problem) => `[${problem.check}] ${problem.message}`)).toEqual([]);
});
