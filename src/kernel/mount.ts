import type { QueryClient } from "@tanstack/react-query";

import { cache, discover, start } from "@onetype/stack-app-kit";
import type { Started } from "@onetype/stack-app-kit";

import { Env } from "./env";
import { Source } from "./source";

export const Mount = {
    open: (client: QueryClient): Promise<Started> =>
    {
        const baseUrl = Env.text("VITE_API_URL", "/api") ?? "/api";

        /* Development only: the fake takes over fetch, so shipping it would
           answer every request from memory however real the server is. */
        if (import.meta.env.DEV)
        {
            Source.install(baseUrl);
        }

        return start({
            plugins: discover(import.meta.glob("../plugins/*/plugin.ts", { eager: true })),
            cache: cache.fromQueries(client),
            transport: {
                baseUrl,
                wsUrl: Env.text("VITE_WS_URL"),
                openSocket: (url) => new WebSocket(url),
            },
        });
    },
};
