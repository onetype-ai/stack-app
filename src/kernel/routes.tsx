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

    const declared = kernel.routes();
    const first = declared[0];

    if (first === undefined)
    {
        throw new Error("No plugin declares a route. One must, or every address answers 404.");
    }

    // "/" belongs to no plugin, so it sends the reader to the first route
    // declared rather than answering 404 at the address they were given.
    const landing = createRoute({
        getParentRoute: () => root,
        path: "/",
        component: () => <Navigate to={first.path} replace />,
    });

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

    return createRouter({ routeTree: root.addChildren([landing, ...pages]) });
};
