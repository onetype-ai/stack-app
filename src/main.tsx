import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { KernelProvider, StartupFailure } from "@onetype/stack-app-kit/react";

import { mount, queries, routes } from "./kernel";
import "@ui/styles/index.css";

import type { QueryClient } from "@tanstack/react-query";
import type { Root } from "react-dom/client";

class AppRunner
{
    root: Root;
    client: QueryClient;

    constructor()
    {
        const container = document.getElementById("root");

        if (!container)
        {
            throw new Error("Mount failed: #root is missing from index.html.");
        }

        this.root = createRoot(container);
        this.client = queries();
    }

    async open(): Promise<void>
    {
        const app = await mount(this.client);

        this.root.render(
            <StrictMode>
                <QueryClientProvider client={this.client}>
                    <KernelProvider kernel={app.kernel}>
                        <RouterProvider router={routes(app.kernel)} />
                    </KernelProvider>
                </QueryClientProvider>
            </StrictMode>,
        );
    }

    failed(cause: unknown): void
    {
        this.root.render(
            <StrictMode>
                <StartupFailure message={cause instanceof Error ? cause.message : String(cause)} />
            </StrictMode>,
        );
    }
}

export const App = new AppRunner();

void App.open().catch((cause: unknown) =>
{
    App.failed(cause);
});
