#!/usr/bin/env node
//
// Does the application actually run in a browser?
//
// jsdom renders components; it does not run a build, a router, a query client
// or a real event loop against a real network stack. Everything here passed in
// jsdom and could still be a blank page, which is what a reader would see.
//
//   pnpm test:browser
//

import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { chromium } from "playwright";

const PORT = Number(process.env["PORT"] ?? 7390);
const AT = `http://localhost:${PORT}`;

// Packed, there are no plugin folders for the bundler's glob to find, so the
// application boots with no routes at all. That is the repository resting,
// not a defect: say so and stop rather than reporting a 404 nobody caused.
const unpacked = (at) => (existsSync(at)
    ? readdirSync(at, { withFileTypes: true }).filter((entry) => entry.isDirectory() || entry.name.endsWith(".ts"))
    : []).length > 0;

if (!unpacked("src/plugins"))
{
    console.log("no plugin folder holds anything, so there are no routes to open. Unpack the examples, or write a plugin.");
    process.exit(0);
}

function serve()
{
    const vite = spawn("npx", ["vite", "--port", String(PORT), "--strictPort"], { stdio: "pipe" });

    return new Promise((ready, fail) =>
    {
        const timer = setTimeout(() => fail(new Error("vite did not start in 30s")), 30_000);

        vite.stdout.on("data", (chunk) =>
        {
            if (String(chunk).includes("ready in"))
            {
                clearTimeout(timer);
                ready(vite);
            }
        });

        vite.on("exit", (code) => fail(new Error(`vite exited with ${code}`)));
    });
}

const vite = await serve();
const browser = await chromium.launch();
const page = await browser.newPage();

const wrong = [];

// Nothing answers /api with no server up, and that is the answer rather than
// a fault. Named here so adding another is a deliberate act.
const answersNotFaults = [/Failed to load resource.*40[34]/];

page.on("console", (line) =>
{
    if (line.type() !== "error" || answersNotFaults.some((one) => one.test(line.text())))
    {
        return;
    }

    wrong.push(`console: ${line.text()}`);
});
page.on("pageerror", (cause) => wrong.push(`threw: ${cause.message}`));

try
{
    await page.goto(AT, { waitUntil: "networkidle" });

    // "/" belongs to no plugin, so it forwards to the first route declared. A
    // reader answered 404 at the address they were given is the whole app
    // broken, whatever that first route happens to be called.
    // A build that failed leaves an empty root: say that rather than blaming
    // the router, which is what a reader would otherwise go and read.
    const mounted = await page.locator("#root").count();
    const painted = ((await page.locator("#root").textContent()) ?? "").trim();

    if (mounted === 0 || painted === "")
    {
        throw new Error(`nothing mounted at #root. The application did not start: read the vite output above, and the console errors below.`);
    }

    const landed = new URL(page.url()).pathname;

    if (landed === "/")
    {
        throw new Error(`"/" forwarded nowhere: the reader is still at "/", which no plugin declares. Something must declare a route.`);
    }

    // Nothing answers /api here, so no document arrives. What must still be
    // true is that the shell rendered and the absence is a state rather than a
    // crash: a blank page with a header passes every unit test there is.
    await page.waitForSelector("main", { timeout: 10_000 });

    // A shell may put its navigation in a header, a sidebar or neither, so ask
    // whether anything on the page leads anywhere rather than where it sits.
    const leads = await page.locator("a[href], button").count();

    if (leads === 0)
    {
        wrong.push("nothing on the page leads anywhere: no link and no control rendered");
    }

    const said = (await page.locator("main").textContent()) ?? "";

    if (said.trim() === "")
    {
        wrong.push("the page rendered nothing at all, not even a reason");
    }

    if (/NaN|undefined|\[object Object\]/.test(said))
    {
        wrong.push(`the page shows a value it never formatted: ${said.slice(0, 80)}`);
    }

    console.log(`the shell rendered, and answered without a server`);
}
finally
{
    await browser.close();
    vite.kill();
}

if (wrong.length > 0)
{
    console.error(`\n${String(wrong.length)} problem${wrong.length === 1 ? "" : "s"} in the browser:`);

    for (const line of wrong)
    {
        console.error(`  ${line}`);
    }

    process.exit(1);
}

console.log("the application runs in a browser");
