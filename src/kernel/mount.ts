import type { QueryClient } from "@tanstack/react-query";

import { cache, discover, start } from "@onetype/stack-app-kit";
import type { Started } from "@onetype/stack-app-kit";

import { env } from "./env";
import { source } from "./source";

export const mount = (client: QueryClient): Promise<Started> =>
{
    const baseUrl = env("VITE_API_URL", "/api") ?? "/api";

    /* Development only: the fake takes over fetch, so shipping it would answer
       every request from memory however real the server behind baseUrl is. */
    if (import.meta.env.DEV)
    {
        source.install(baseUrl);
    }

    return start({
        plugins: discover(import.meta.glob("../plugins/*/plugin.ts", { eager: true })),
        cache: cache.fromQueries(client),
        transport: {
            baseUrl,
            wsUrl: env("VITE_WS_URL"),
            openSocket: (url) => new WebSocket(url),
        },
    });
};
