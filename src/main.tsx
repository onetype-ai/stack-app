import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { KernelProvider, StartupFailure } from "@onetype/stack-app-kit/react";

import { Mount, Queries, Routes } from "./kernel";
import "@ui/styles/index.css";

import type { QueryClient } from "@tanstack/react-query";
import type { Root } from "react-dom/client";

class Application
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
        this.client = Queries.create();
    }

    async open(): Promise<void>
    {
        const app = await Mount.open(this.client);

        this.root.render(
            <StrictMode>
                <QueryClientProvider client={this.client}>
                    <KernelProvider kernel={app.kernel}>
                        <RouterProvider router={Routes.build(app.kernel)} />
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

export const app = new Application();

void app.open().catch((cause: unknown) =>
{
    app.failed(cause);
});
