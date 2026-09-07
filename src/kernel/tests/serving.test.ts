import { describe, expect, test } from "vitest";

import config from "../../../vite.config";

const serverFor = (env: Record<string, string> = {}): Record<string, unknown> =>
{
    const before = process.env;

    process.env = { ...before, ...env };

    try
    {
        const built = config({ mode: "development", command: "serve" }) as { server: Record<string, unknown> };

        return built.server;
    }
    finally
    {
        process.env = before;
    }
};

describe("where this application listens", () =>
{
    test("is a port of its own, so it never collides with the api or another front", () =>
    {
        expect(serverFor()["port"]).toBe(7380);
    });

    test("and moves where PORT says, so several people run their own", () =>
    {
        expect(serverFor({ PORT: "7381" })["port"]).toBe(7381);
    });

    test("refuses to start on a port already taken, rather than quietly moving", () =>
    {
        expect(serverFor()["strictPort"]).toBe(true);
    });

    test("and refuses a port that is not one", () =>
    {
        expect(() => serverFor({ PORT: "abc" })).toThrow(/whole port/);
        expect(() => serverFor({ PORT: "99999" })).toThrow(/whole port/);
        expect(() => serverFor({ PORT: "0" })).toThrow(/whole port/);
    });
});

describe("which server /api reaches", () =>
{
    test("is the api's own port, so a front out of the box finds one", () =>
    {
        const proxy = serverFor()["proxy"] as Record<string, { target: string }>;

        expect(proxy["/api"]?.target).toBe("http://localhost:7280");
    });

    test("and moves where API_PORT says, so a front reaches a back of its own", () =>
    {
        const proxy = serverFor({ API_PORT: "7281" })["proxy"] as Record<string, { target: string }>;

        expect(proxy["/api"]?.target).toBe("http://localhost:7281");
    });

    test("strips the prefix, so a plugin asking for /api/documents reaches /documents", () =>
    {
        const proxy = serverFor()["proxy"] as Record<string, { rewrite: (path: string) => string }>;

        expect(proxy["/api"]?.rewrite("/api/documents")).toBe("/documents");
    });

    test("and refuses an api port that is not one", () =>
    {
        expect(() => serverFor({ API_PORT: "nowhere" })).toThrow(/whole port/);
    });
});
