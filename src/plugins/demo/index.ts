import type { Context } from "@onetype/stack-app-kit";
import { usePlugin } from "@onetype/stack-app-kit/react";
import type { PluginHandle } from "@onetype/stack-app-kit/react";

import type { ItemsService } from "./services/items";
import type { SessionService } from "./services/session";
import type { DemoConfig } from "./types/DemoConfig";
import type { DemoItem } from "./types/DemoItem";
import type { DemoItemPage } from "./types/DemoItemPage";
import type { DemoListQuery } from "./types/DemoListQuery";

export type DemoServices = {
    items: ItemsService;
    session: SessionService;
};

export type DemoHandle = PluginHandle<DemoConfig, DemoServices>;

const services = (ctx: Context): DemoServices =>
{
    return ctx.use<DemoServices>("demo");
};

export const Demo = {
    use: (): DemoHandle =>
    {
        return usePlugin<DemoConfig, DemoServices>("demo");
    },

    list: (ctx: Context, query: Partial<DemoListQuery> = {}): Promise<DemoItemPage> =>
    {
        return services(ctx).items.list(query);
    },

    create: (ctx: Context, title: string): Promise<DemoItem> =>
    {
        return services(ctx).items.create(title);
    },

    remove: (ctx: Context, id: string): Promise<void> =>
    {
        return services(ctx).items.remove(id);
    },

    signedIn: (ctx: Context): boolean =>
    {
        return services(ctx).session.current() !== undefined;
    },
};

export type { DemoItem } from "./types/DemoItem";
export type { DemoItemPage } from "./types/DemoItemPage";
export type { DemoListQuery } from "./types/DemoListQuery";
export type { DemoStatus } from "./types/DemoStatus";
