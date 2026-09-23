import { createMemoryHistory, createRootRoute, createRoute, createRouter, Navigate, Outlet, useParams } from "@tanstack/react-router";

import { cache, discover, start } from "@onetype/stack-app-kit";
import { NotFound, RouteGuard } from "@onetype/stack-app-kit/react";

import { Env } from "./env";
import { Log } from "./log";

import type { QueryClient } from "@tanstack/react-query";
import type { Logger, RouterOptions, StartedApp } from "@onetype/stack-app-kit";

export type MountOptions = {
    isPrerendered?: boolean;
    log?: Logger;
};

export const Mount = {
    open: (client: QueryClient, { isPrerendered = false, log = Log.create() }: MountOptions = {}): Promise<StartedApp> =>
    {
        return start({
            plugins: discover(import.meta.glob("../plugins/*/plugin.ts", { eager: true })),
            environment: import.meta.env,
            prerendered: isPrerendered,
            log,
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
                guard: (route) => () => <RouteGuard route={route} params={useParams({ strict: false })} send={(to) => <Navigate to={to} replace />} />,
                history: (path) => createMemoryHistory({ initialEntries: [path] }),
            },
        });
    },
};
