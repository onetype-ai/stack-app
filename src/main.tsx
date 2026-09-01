import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { KernelProvider, StartupFailure } from "@onetype/stack-app-kit/react";

import { mount, queries, routes } from "./kernel";
import "@ui/styles/index.css";

const container = document.getElementById("root");

if (!container)
{
    throw new Error("Mount failed: #root is missing from index.html.");
}

const root = createRoot(container);
const client = queries();

const begin = async (): Promise<void> =>
{
    const app = await mount(client);

    root.render(
        <StrictMode>
            <QueryClientProvider client={client}>
                <KernelProvider kernel={app.kernel}>
                    <RouterProvider router={routes(app.kernel)} />
                </KernelProvider>
            </QueryClientProvider>
        </StrictMode>,
    );
};

void begin().catch((cause: unknown) =>
{
    root.render(
        <StrictMode>
            <StartupFailure message={cause instanceof Error ? cause.message : String(cause)} />
        </StrictMode>,
    );
});
