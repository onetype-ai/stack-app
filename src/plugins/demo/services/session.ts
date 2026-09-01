import type { Context } from "@onetype/stack-app-kit";

import { Session } from "../types/Session";

export const createSessionService = (ctx: Context<{ sessionPath: string }>) =>
{
    let current: Session | undefined;

    return {
        current: (): Session | undefined =>
        {
            return current;
        },

        permissions: (): readonly string[] =>
        {
            return current?.permissions ?? [];
        },

        load: async (): Promise<Session | undefined> =>
        {
            try
            {
                current = Session.schema.parse(await ctx.http.get(ctx.config.sessionPath));

                return current;
            }
            catch (cause: unknown)
            {
                ctx.log.warn("no session could be loaded", {
                    error: cause instanceof Error ? cause.message : String(cause),
                });

                current = undefined;

                return undefined;
            }
        },

        signOut: (): void =>
        {
            current = undefined;
        },
    };
};

export type SessionService = ReturnType<typeof createSessionService>;
