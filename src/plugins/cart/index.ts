import { usePlugin } from "@onetype/stack-app-kit/react";

import { Bay } from "./types/Bay";

import type { Context } from "@onetype/stack-app-kit";
import type { PluginHandle } from "@onetype/stack-app-kit/react";
import type { PickingService } from "./services/picking";
import type { CartConfig } from "./types/CartConfig";

export type CartServices = {
    picking: PickingService;
};

export type CartHandle = PluginHandle<CartConfig, CartServices>;

export const Cart = {
    use: (): CartHandle =>
    {
        return usePlugin<CartConfig, CartServices>("cart");
    },

    handOver: (ctx: Context, bay: string): Promise<void> =>
    {
        return ctx.commands.run("cart.hand-over", { bay: Bay.parse(bay) });
    },
};

export type { Line } from "./types/Line";
export type { PickList } from "./types/PickList";
