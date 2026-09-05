import type { Context } from "@onetype/stack-app-kit";

import { viewerApi } from "../api/viewer";
import type { Viewer } from "../types/Viewer";

export const createViewerService = (ctx: Context<{ sessionPath: string }>) =>
{
    let current: Viewer | undefined;

    return {
        current: (): Viewer | undefined =>
        {
            return current;
        },

        permissions: (): readonly string[] =>
        {
            return current?.permissions ?? [];
        },

        load: async (): Promise<Viewer | undefined> =>
        {
            try
            {
                current = await viewerApi.load(ctx, ctx.config.sessionPath);

                return current;
            }
            catch (cause: unknown)
            {
                ctx.log.warn("nobody is at the desk", {
                    error: cause instanceof Error ? cause.message : String(cause),
                });

                current = undefined;

                return undefined;
            }
        },
    };
};

export type ViewerService = ReturnType<typeof createViewerService>;
