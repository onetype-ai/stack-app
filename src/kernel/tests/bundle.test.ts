import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { expect, test } from "vitest";

const build = (environment: Readonly<Record<string, string>>): { status: number | null; output: string; bundle: string } =>
{
    const outDir = mkdtempSync(join(tmpdir(), "stack-app-bundle-"));

    try
    {
        const run = spawnSync("pnpm", ["exec", "vite", "build", "--outDir", outDir, "--emptyOutDir", "--logLevel", "error"], {
            cwd: process.cwd(),
            env: { ...process.env, SITE_ORIGIN: "http://localhost:7380", ...environment },
            encoding: "utf8",
        });
        const assets = join(outDir, "assets");
        const bundle = existsSync(assets)
            ? readdirSync(assets).filter((file) => file.endsWith(".js")).map((file) => readFileSync(join(assets, file), "utf8")).join("\n")
            : "";

        return { status: run.status, output: `${run.stdout}${run.stderr}`, bundle };
    }
    finally
    {
        rmSync(outDir, { recursive: true, force: true });
    }
};

test("a build refuses a VITE_ variable named like a secret, so its value never reaches the bundle", () =>
{
    const refused = build({ VITE_PROBE__TOKEN: "probe-token-2b8e" });

    expect(refused.status).not.toBe(0);
    expect(refused.output).toContain("VITE_PROBE__TOKEN");
    expect(refused.bundle).not.toContain("probe-token-2b8e");
}, 120_000);
