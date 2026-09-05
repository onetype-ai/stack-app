import type { Context } from "@onetype/stack-app-kit";

import { Viewer } from "../types/Viewer";

export const viewerApi = {
    load: async (ctx: Context, path: string): Promise<Viewer> =>
    {
        return Viewer.schema.parse(await ctx.http.get(path));
    },
};
