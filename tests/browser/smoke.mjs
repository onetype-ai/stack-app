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

if (!unpacked("src/plugins") || !unpacked("src/utils"))
{
    console.log("the examples are packed away, so there is no application to open. Unpack the plugins and the utils first.");
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

    // "/" belongs to no plugin. A reader who opens the application and is
    // answered 404 at the address they were given is the whole app broken.
    if (!page.url().endsWith("/documents"))
    {
        throw new Error(`"/" did not send the reader anywhere: it stayed at ${page.url()}, which is a 404 at the address the application is opened by.`);
    }

    // Nothing answers /api here, so no document arrives. What must still be
    // true is that the shell rendered and the absence is a state rather than a
    // crash: a blank page with a header passes every unit test there is.
    await page.waitForSelector("main", { timeout: 10_000 });

    const shell = await page.locator("header a").count();

    if (shell === 0)
    {
        wrong.push("the frame rendered without its own navigation");
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
