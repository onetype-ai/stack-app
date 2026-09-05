import { createRootRoute, createRoute, createRouter, Navigate } from "@tanstack/react-router";

import { NotFound, RouteGuard } from "@onetype/stack-app-kit/react";
import type { Kernel } from "@onetype/stack-app-kit";

export const routes = (kernel: Kernel) =>
{
    const frame = kernel.frame();

    if (frame === undefined)
    {
        throw new Error("No plugin declares a frame. One must, or every page renders without a shell.");
    }

    const root = createRootRoute({ component: frame, notFoundComponent: NotFound });

    const pages = kernel.routes().map((route) =>
        createRoute({
            getParentRoute: () => root,
            path: route.path,
            component: () => <RouteGuard route={route} send={(to) => <Navigate to={to} replace />} />,
            validateSearch: (raw: Record<string, unknown>): unknown =>
            {
                return route.search === undefined ? {} : route.search.parse(raw);
            },
        }),
    );

    return createRouter({ routeTree: root.addChildren(pages) });
};
