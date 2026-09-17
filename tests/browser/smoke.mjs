//
// Opens the application in a real browser and reads the page.
//
// A frame that rendered its shell around nothing passed every test in this
// project and was visible here in a second: the router hands a page to an
// outlet rather than passing children, and only a browser renders that.
//
// Run: pnpm test:browser   (PORT= to point it elsewhere)
//

import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";

import { chromium } from "playwright";

const PORT = process.env.PORT ?? "7390";
const ORIGIN = `http://localhost:${PORT}`;

const reachable = async () =>
{
    try
    {
        await fetch(ORIGIN);

        return true;
    }
    catch
    {
        return false;
    }
};

const serving = async () =>
{
    if (await reachable())
    {
        return undefined;
    }

    const vite = spawn("pnpm", ["exec", "vite", "--port", PORT, "--strictPort"], {
        stdio: "ignore",
        detached: false,
    });

    for (let tries = 0; tries < 60; tries += 1)
    {
        await wait(500);

        if (await reachable())
        {
            return vite;
        }
    }

    vite.kill();

    throw new Error(`The application never answered on ${ORIGIN}.`);
};

const vite = await serving();
const browser = await chromium.launch();

const problems = [];

try
{
    const page = await browser.newPage();

    page.on("console", (message) =>
    {
        if (message.type() === "error")
        {
            problems.push(`console: ${message.text()}`);
        }
    });

    page.on("pageerror", (error) =>
    {
        problems.push(`threw: ${error.message}`);
    });

    await page.goto(ORIGIN, { waitUntil: "networkidle" });
    await wait(1500);

    const root = await page.evaluate(() => document.getElementById("root")?.innerHTML ?? undefined);

    if (root === undefined)
    {
        problems.push("#root is missing from the page, so nothing could have mounted.");
    }

    const routes = await page.evaluate(() => document.querySelectorAll("[data-route]").length);

    console.log(`${ORIGIN} answered. #root ${root === "" ? "is empty" : "holds markup"}, ${String(routes)} routes marked.`);
}
finally
{
    await browser.close();
    vite?.kill();
}

if (problems.length > 0)
{
    console.error(`\n${String(problems.length)} problem(s) a test runner does not see:\n`);

    for (const problem of problems)
    {
        console.error(`  - ${problem}`);
    }

    process.exit(1);
}

console.log("No console error, and nothing threw.");
