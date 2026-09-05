import type { QueryClient } from "@tanstack/react-query";

import { cache, discover, start } from "@onetype/stack-app-kit";
import type { Started } from "@onetype/stack-app-kit";

import { env } from "./env";
import { source } from "./source";

export const mount = (client: QueryClient): Promise<Started> =>
{
    const baseUrl = env("VITE_API_URL", "/api") ?? "/api";

    source.install(baseUrl);

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
