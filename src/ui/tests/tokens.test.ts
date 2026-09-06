import { join } from "node:path";
import { expect, test } from "vitest";

import { findUnknownClasses, findUnknownTokens } from "@onetype/stack-app-kit/testing";

/**
 * A token nobody declared is not an error anywhere: CSS resolves it to
 * nothing and the rule silently does not apply. Eleven stylesheets here were
 * written against names that did not exist, and everything still built.
 */
test("every token a stylesheet asks for is declared", () =>
{
    expect(findUnknownTokens(join(process.cwd(), "src"))).toEqual([]);
});

/**
 * The same defect one layer up: a CSS module answers a name it never declared
 * with undefined, React drops the className without a word, and the element
 * renders unstyled while every test still passes.
 */
test("every class a component reads is declared by its own module", () =>
{
    expect(findUnknownClasses(join(process.cwd(), "src"))).toEqual([]);
});
