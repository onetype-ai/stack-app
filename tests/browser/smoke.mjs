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

const PORT = 5177;
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

page.on("console", (line) => line.type() === "error" && wrong.push(`console: ${line.text()}`));
page.on("pageerror", (cause) => wrong.push(`threw: ${cause.message}`));

try
{
    await page.goto(AT, { waitUntil: "networkidle" });

    // "/" belongs to no plugin. A reader who opens the application and is
    // answered 404 at the address they were given is the whole app broken.
    if (!page.url().endsWith("/catalog"))
    {
        throw new Error(`"/" did not send the reader anywhere: it stayed at ${page.url()}, which is a 404 at the address the application is opened by.`);
    }

    // The stock list is what a reader came for: a shell that rendered with no
    // parts is a blank page with a header, and every unit test still passes.
    await page.waitForSelector("main li", { timeout: 10_000 });

    const parts = await page.locator("main li").count();

    if (parts === 0)
    {
        wrong.push("the stock list rendered with no parts");
    }

    // A price is money formatted at the edge. Reaching the page as NaN or as a
    // raw integer is what a reader notices first and no unit test sees.
    const shown = await page.locator("main li").first().textContent();

    if (shown === null || /NaN/.test(shown) || !/[€$¥]\s?\d[.,]\d\d/.test(shown))
    {
        wrong.push(`the first part carries no readable price: ${String(shown)}`);
    }

    console.log(`rendered ${String(parts)} parts`);
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
