import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";

import { KernelProvider, useLocaleAfterHydration } from "@onetype/stack-app-kit/react";

import type { QueryClient } from "@tanstack/react-query";
import type { StartedApp } from "@onetype/stack-app-kit";

export type TreeProps = {
    app: StartedApp;
    client: QueryClient;
    viewerLocale?: string | undefined;
};

const ViewerLocale = ({ tag }: { tag: string | undefined }) =>
{
    useLocaleAfterHydration(tag);

    return null;
};

export const Tree = ({ app, client, viewerLocale }: TreeProps) =>
{
    return (
        <StrictMode>
            <QueryClientProvider client={client}>
                <KernelProvider kernel={app.kernel}>
                    <ViewerLocale tag={viewerLocale} />
                    <RouterProvider router={app.router as never} />
                </KernelProvider>
            </QueryClientProvider>
        </StrictMode>
    );
};
