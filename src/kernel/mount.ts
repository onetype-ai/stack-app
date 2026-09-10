import type { QueryClient } from "@tanstack/react-query";

import { cache, discover, start } from "@onetype/stack-app-kit";
import type { StartedApp } from "@onetype/stack-app-kit";

import { Env } from "./env";

export const Mount = {
    open: (client: QueryClient): Promise<StartedApp> =>
    {
        const baseUrl = Env.text("VITE_API_URL", "/api") ?? "/api";

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
