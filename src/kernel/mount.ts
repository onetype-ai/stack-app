import type { QueryClient } from "@tanstack/react-query";

import { cache, discover, start } from "@onetype/stack-app-kit";
import type { Started } from "@onetype/stack-app-kit";

import { env } from "./env";

export const mount = (client: QueryClient): Promise<Started> =>
    start({
        plugins: discover(import.meta.glob("../plugins/*/plugin.ts", { eager: true })),
        cache: cache.fromQueries(client),
        transport: {
            baseUrl: env("VITE_API_URL", "/api") ?? "/api",
            wsUrl: env("VITE_WS_URL"),
            openSocket: (url) => new WebSocket(url),
        },
    });
