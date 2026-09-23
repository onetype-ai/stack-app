import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";

import { AppBoundary, KernelProvider, useLocaleAfterHydration } from "@onetype/stack-app-kit/react";

import type { QueryClient } from "@tanstack/react-query";
import type { Logger, StartedApp } from "@onetype/stack-app-kit";

export type TreeProps = {
    app: StartedApp;
    client: QueryClient;
    viewerLocale?: string | undefined;
    log?: Logger | undefined;
};

const ViewerLocale = ({ tag }: { tag: string | undefined }) =>
{
    useLocaleAfterHydration(tag);

    return null;
};

export const Tree = ({ app, client, viewerLocale, log }: TreeProps) =>
{
    return (
        <StrictMode>
            <QueryClientProvider client={client}>
                <KernelProvider kernel={app.kernel}>
                    <ViewerLocale tag={viewerLocale} />
                    <AppBoundary onError={(error) => log?.error("a page failed to render", { error: String(error) })}>
                        <RouterProvider router={app.router as never} />
                    </AppBoundary>
                </KernelProvider>
            </QueryClientProvider>
        </StrictMode>
    );
};
