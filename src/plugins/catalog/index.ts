import { usePlugin } from "@onetype/stack-app-kit/react";

import type { Context } from "@onetype/stack-app-kit";
import type { PluginHandle } from "@onetype/stack-app-kit/react";
import type { PartsService } from "./services/parts";
import type { ViewerService } from "./services/viewer";
import type { CatalogConfig } from "./types/CatalogConfig";
import type { Part } from "./types/Part";

export type CatalogServices = {
    parts: PartsService;
    viewer: ViewerService;
};

export type CatalogHandle = PluginHandle<CatalogConfig, CatalogServices>;

const reach = (ctx: Context): CatalogServices =>
{
    return ctx.use<CatalogServices>("catalog");
};

export const Catalog = {
    use: (): CatalogHandle =>
    {
        return usePlugin<CatalogConfig, CatalogServices>("catalog");
    },

    partOf: (ctx: Context, id: string): Promise<Part> =>
    {
        return reach(ctx).parts.get(id);
    },

    priceOf: (ctx: Context, id: string): Promise<number> =>
    {
        return reach(ctx).parts.price(id);
    },
};

export { PartRow } from "./components/PartRow/PartRow";
export type { PartRowProps } from "./components/PartRow/PartRow";

export type { Beside } from "./types/Beside";
export type { Part } from "./types/Part";
export type { PartKind } from "./types/PartKind";
export type { Withdrawal } from "./types/Withdrawal";
