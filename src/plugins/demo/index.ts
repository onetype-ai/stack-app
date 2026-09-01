import { usePlugin } from "@onetype/stack-app-kit/react";
import type { PluginHandle } from "@onetype/stack-app-kit/react";

import type { ItemsService } from "./services/items";
import type { SessionService } from "./services/session";
import type { DemoConfig } from "./types/DemoConfig";

export type DemoServices = {
    items: ItemsService;
    session: SessionService;
};

export type DemoHandle = PluginHandle<DemoConfig, DemoServices>;

export const Demo = {
    use: (): DemoHandle =>
    {
        return usePlugin<DemoConfig, DemoServices>("demo");
    },
};

export type { DemoItem } from "./types/DemoItem";
export type { DemoItemPage } from "./types/DemoItemPage";
export type { DemoListQuery } from "./types/DemoListQuery";
export type { DemoStatus } from "./types/DemoStatus";
