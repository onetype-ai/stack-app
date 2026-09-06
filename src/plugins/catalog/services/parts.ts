import type { Context } from "@onetype/stack-app-kit";

import { partsApi } from "../api/parts";
import type { Part } from "../types/Part";
import type { PartPage } from "../types/PartPage";
import { PartQuery } from "../types/PartQuery";
import { Withdrawal } from "../types/Withdrawal";
import { CatalogKeys } from "../utils/CatalogKeys";

export const createPartsService = (ctx: Context) =>
{
    const seen = new Map<string, Part>();

    const remember = (part: Part): Part =>
    {
        seen.set(part.id, part);

        return part;
    };

    return {
        cached: (id: string): Part | undefined =>
        {
            return seen.get(id);
        },

        list: async (query: Partial<PartQuery> = {}): Promise<PartPage> =>
        {
            const page = await partsApi.list(ctx, PartQuery.schema.parse(query));

            for (const part of page.parts)
            {
                remember(part);
            }

            return page;
        },

        get: async (id: string): Promise<Part> =>
        {
            return remember(await partsApi.get(ctx, id));
        },

        price: async (id: string): Promise<number> =>
        {
            const known = seen.get(id);

            if (known !== undefined)
            {
                return known.cents;
            }

            return remember(await partsApi.get(ctx, id)).cents;
        },

        withdraw: async (id: string): Promise<void> =>
        {
            const known = seen.get(id);
            const part = known ?? remember(await partsApi.get(ctx, id));
            const withdrawal = Withdrawal.schema.parse({ id: part.id, name: part.name });
            const refused = await ctx.hooks.run("catalog.part.before-withdraw", withdrawal);

            if (refused !== undefined)
            {
                throw new Error(`This part cannot be withdrawn: ${refused}`);
            }

            await partsApi.withdraw(ctx, id);

            seen.delete(id);

            ctx.cache.invalidate(CatalogKeys.parts());
            ctx.events.emit("catalog.part.withdrawn", Withdrawal.schema.parse({ id, name: part.name }));
        },
    };
};

export type PartsService = ReturnType<typeof createPartsService>;
