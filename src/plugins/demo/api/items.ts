import type { Context } from "@onetype/stack-app-kit";

import { DemoItem } from "../types/DemoItem";
import { DemoItemPage } from "../types/DemoItemPage";
import type { DemoListQuery } from "../types/DemoListQuery";

export const itemsApi = {
    list: async (ctx: Context, query: DemoListQuery): Promise<DemoItemPage> =>
    {
        const response = await ctx.http.get("/demo/items", { query });

        return DemoItemPage.schema.parse(response);
    },

    get: async (ctx: Context, id: string): Promise<DemoItem> =>
    {
        const response = await ctx.http.get(`/demo/items/${encodeURIComponent(id)}`);

        return DemoItem.schema.parse(response);
    },

    create: async (ctx: Context, title: string): Promise<DemoItem> =>
    {
        const response = await ctx.http.post("/demo/items", { body: { title } });

        return DemoItem.schema.parse(response);
    },

    remove: async (ctx: Context, id: string): Promise<void> =>
    {
        await ctx.http.delete(`/demo/items/${encodeURIComponent(id)}`);
    },
};
