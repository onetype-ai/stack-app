import type { Context } from "@onetype/stack-app-kit";
import type { CatalogConfig } from "../types/CatalogConfig";

export type Asked = {
    method: string;
    path: string;
    query?: unknown;
};

export type Fake = {
    ctx: Context<CatalogConfig>;
    asked: Asked[];
    told: { event: string; payload: unknown }[];
    dropped: (readonly unknown[])[];
    refusal: string | undefined;
};

export type Canned = Readonly<Record<string, unknown>>;

/**
 * A context that reaches nothing.
 *
 * Every answer is written by the test, so a service that stopped calling the
 * transport fails here rather than passing on a cached truth.
 */
export const serving = (canned: Canned, config: Readonly<Record<string, unknown>> = {}): Fake =>
{
    const asked: Asked[] = [];
    const told: { event: string; payload: unknown }[] = [];
    const dropped: (readonly unknown[])[] = [];

    const held: Fake = {
        asked,
        told,
        dropped,
        refusal: undefined,
        ctx: undefined as unknown as Context<CatalogConfig>,
    };

    const answer = (method: string) =>
    {
        return (path: string, request?: { query?: unknown }): Promise<unknown> =>
        {
            asked.push({ method, path, ...(request?.query !== undefined && { query: request.query }) });

            const canning = canned[`${method} ${path}`];

            if (canning === undefined)
            {
                return Promise.reject(new Error(`Nothing canned answers ${method} ${path}.`));
            }

            return Promise.resolve(canning);
        };
    };

    held.ctx = {
        name: "catalog",
        config: { currency: "EUR", lowStock: 20, sessionPath: "/session", ...config },
        services: {},

        log: { debug: () => undefined, info: () => undefined, warn: () => undefined, error: () => undefined },

        http: {
            get: answer("GET"),
            post: answer("POST"),
            put: answer("PUT"),
            patch: answer("PATCH"),
            delete: answer("DELETE"),
        },

        cache: {
            invalidate: (key) =>
            {
                dropped.push(key);
            },
        },

        realtime: {
            channel: () => "http",
            subscribe: () => ({ close: () => undefined }),
        },

        events: {
            emit: (event, payload) =>
            {
                told.push({ event, payload });
            },
            on: () => () => undefined,
        },

        hooks: {
            run: () => Promise.resolve(held.refusal),
        },

        permissions: {
            has: () => true,
            all: () => true,
        },

        commands: {
            run: () => Promise.resolve(),
        },

        use: () => ({}) as never,
    } as Context<CatalogConfig>;

    return held;
};
