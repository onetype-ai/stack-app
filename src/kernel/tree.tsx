import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";

import { KernelProvider } from "@onetype/stack-app-kit/react";

import type { QueryClient } from "@tanstack/react-query";
import type { StartedApp } from "@onetype/stack-app-kit";

export type TreeProps = {
    app: StartedApp;
    client: QueryClient;
};

export const Tree = ({ app, client }: TreeProps) =>
{
    return (
        <StrictMode>
            <QueryClientProvider client={client}>
                <KernelProvider kernel={app.kernel}>
                    <RouterProvider router={app.router as never} />
                </KernelProvider>
            </QueryClientProvider>
        </StrictMode>
    );
};
