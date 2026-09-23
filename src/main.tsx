import { hydrate } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

import { locale, logs } from "@onetype/stack-app-kit";
import { prerenderedLocale, prerenderedState, StartupFailure } from "@onetype/stack-app-kit/react";

import { Locales, Log, Mount, Queries, Tree } from "./kernel";

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
        const viewerLocale = locale.negotiate(navigator.languages, Locales.supported, Locales.fallback);

        logs.captureErrors(log, window);

        if (state !== undefined && state !== null)
        {
            hydrate(this.client, state);
        }

        const app = await Mount.open(this.client, { isPrerendered, log, locale: prerenderedLocale() ?? viewerLocale });
        const tree = <Tree app={app} client={this.client} viewerLocale={viewerLocale} log={log} />;

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
