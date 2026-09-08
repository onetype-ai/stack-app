import { createRootRoute, createRoute, createRouter, Navigate } from "@tanstack/react-router";

import { NotFound, RouteGuard } from "@onetype/stack-app-kit/react";
import type { Kernel } from "@onetype/stack-app-kit";

export const Routes = {
    build: (kernel: Kernel) =>
    {
        const frame = kernel.frame();

        if (frame === undefined)
        {
            throw new Error("No plugin declares a frame. One must, or every page renders without a shell.");
        }

        const root = createRootRoute({ component: frame, notFoundComponent: NotFound });

        const declaredRoutes = kernel.routes();
        const whereLandingSends = declaredRoutes[0];

        if (whereLandingSends === undefined)
        {
            throw new Error("No plugin declares a route. One must, or every address answers 404.");
        }

        const landing = declaredRoutes.some((route) => route.path === "/")
            ? []
            : [createRoute({
                getParentRoute: () => root,
                path: "/",
                component: () => <Navigate to={whereLandingSends.path} replace />,
            })];

        const pages = kernel.routes().map((route) =>
            createRoute({
                getParentRoute: () => root,
                path: route.path,
                component: () => <RouteGuard route={route} send={(to) => <Navigate to={to} replace />} />,
                validateSearch: (query: Record<string, unknown>): unknown =>
                {
                    return route.search === undefined ? {} : route.search.parse(query);
                },
            }),
        );

        return createRouter({ routeTree: root.addChildren([...landing, ...pages]) });
    },
};
