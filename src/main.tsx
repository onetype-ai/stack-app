import { hydrate } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

import { logs } from "@onetype/stack-app-kit";
import { prerenderedState, StartupFailure } from "@onetype/stack-app-kit/react";

import { Log, Mount, Queries, Tree } from "./kernel";

import type { QueryClient } from "@tanstack/react-query";
import type { Root } from "react-dom/client";

class Application
{
    container: HTMLElement;
    client: QueryClient;
    root: Root | undefined;

    constructor()
    {
        const container = document.getElementById("root");

        if (!container)
        {
            throw new Error("Mount failed: #root is missing from index.html.");
        }

        this.container = container;
        this.client = Queries.create();
    }

    async open(): Promise<void>
    {
        const log = Log.create();
        const state = prerenderedState();
        const isPrerendered = state !== undefined;

        logs.captureErrors(log, window);

        if (state !== undefined && state !== null)
        {
            hydrate(this.client, state);
        }

        const app = await Mount.open(this.client, { isPrerendered, log });
        const tree = <Tree app={app} client={this.client} />;

        if (isPrerendered)
        {
            this.root = hydrateRoot(this.container, tree);

            return;
        }

        this.root = createRoot(this.container);
        this.root.render(tree);
    }

    failed(cause: unknown): void
    {
        this.root ??= createRoot(this.container);
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
