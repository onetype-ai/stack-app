import type { Context } from "@onetype/stack-app-kit";

import { itemsApi } from "../api/items";
import { DemoItem } from "../types/DemoItem";
import type { DemoItemPage } from "../types/DemoItemPage";
import { DemoListQuery } from "../types/DemoListQuery";

export const createItemsService = (ctx: Context) =>
{
    let seen: readonly DemoItem[] = [];

    return {
        seen: (): readonly DemoItem[] =>
        {
            return seen;
        },

        list: async (query: Partial<DemoListQuery> = {}): Promise<DemoItemPage> =>
        {
            const page = await itemsApi.list(ctx, DemoListQuery.schema.parse(query));

            seen = page.items;

            return page;
        },

        get: async (id: string): Promise<DemoItem> =>
        {
            return itemsApi.get(ctx, id);
        },

        create: async (rawTitle: string): Promise<DemoItem> =>
        {
            const title = DemoItem.parseTitle(rawTitle);
            const rejection = await ctx.hooks.run("demo.item.before-create", { title });

            if (rejection !== undefined)
            {
                throw new Error(`Creating the item was rejected: ${rejection}`);
            }

            const item = await itemsApi.create(ctx, title);

            ctx.events.emit("demo.item.created", { id: item.id, createdAt: item.createdAt });

            return item;
        },

        remove: async (id: string): Promise<void> =>
        {
            await itemsApi.remove(ctx, id);

            seen = seen.filter((one) => one.id !== id);

            ctx.events.emit("demo.item.deleted", { id });
        },
    };
};

export type ItemsService = ReturnType<typeof createItemsService>;
