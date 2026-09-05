import type { Context } from "@onetype/stack-app-kit";

import { Part } from "../types/Part";
import { PartPage } from "../types/PartPage";
import type { PartQuery } from "../types/PartQuery";

export const partsApi = {
    list: async (ctx: Context, query: PartQuery): Promise<PartPage> =>
    {
        const answered = await ctx.http.get("/catalog/parts", {
            query: { ...(query.kind !== undefined && { kind: query.kind }) },
        });

        return PartPage.schema.parse(answered);
    },

    get: async (ctx: Context, id: string): Promise<Part> =>
    {
        const answered = await ctx.http.get(`/catalog/parts/${encodeURIComponent(id)}`);

        return Part.schema.parse(answered);
    },

    withdraw: async (ctx: Context, id: string): Promise<Part> =>
    {
        const answered = await ctx.http.delete(`/catalog/parts/${encodeURIComponent(id)}`);

        return Part.schema.parse(answered);
    },
};
