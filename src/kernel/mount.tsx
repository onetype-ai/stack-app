import { createRootRoute, createRoute, createRouter, Navigate, Outlet } from "@tanstack/react-router";

import { cache, discover, start } from "@onetype/stack-app-kit";
import { NotFound, RouteGuard } from "@onetype/stack-app-kit/react";

import { Env } from "./env";

import type { QueryClient } from "@tanstack/react-query";
import type { RouterOptions, StartedApp } from "@onetype/stack-app-kit";

export const Mount = {
    open: (client: QueryClient): Promise<StartedApp> =>
    {
        return start({
            plugins: discover(import.meta.glob("../plugins/*/plugin.ts", { eager: true })),
            cache: cache.fromQueries(client),
            transport: {
                baseUrl: Env.text("VITE_API_URL", "/api") ?? "/api",
                wsUrl: Env.text("VITE_WS_URL"),
                openSocket: (url) => new WebSocket(url),
            },
            router: {
                building: { createRootRoute, createRoute, createRouter } as unknown as RouterOptions,
                missing: NotFound,
                outlet: Outlet,
                wrap: (Frame, Page) => (Frame === undefined ? Page : () => <Frame><Page /></Frame>),
                landing: (to) => () => <Navigate to={to} replace />,
                guard: (route) => () => <RouteGuard route={route} send={(to) => <Navigate to={to} replace />} />,
            },
        });
    },
};
