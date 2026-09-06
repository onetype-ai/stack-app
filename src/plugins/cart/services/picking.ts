import { Catalog } from "@plugins/catalog";

import type { Context } from "@onetype/stack-app-kit";
import type { CartConfig } from "../types/CartConfig";
import type { Line } from "../types/Line";
import type { PickList } from "../types/PickList";
import { Lines } from "../utils/Lines";

export const createPickingService = (ctx: Context<CartConfig>) =>
{
    let lines: readonly Line[] = [];

    const listeners = new Set<() => void>();

    let answer: PickList = { lines: [], cents: 0, items: 0 };

    const settle = (next: readonly Line[]): void =>
    {
        lines = next;
        answer = { lines: [...next], cents: Lines.cents(next), items: Lines.items(next) };

        for (const told of listeners)
        {
            told();
        }
    };

    return {
        read: (): PickList =>
        {
            return answer;
        },

        watch: (told: () => void): (() => void) =>
        {
            listeners.add(told);

            return () =>
            {
                listeners.delete(told);
            };
        },

        holds: (partId: string): boolean =>
        {
            return Lines.holds(lines, partId);
        },

        add: async (partId: string, name: string): Promise<void> =>
        {
            const already = lines.find((line) => line.partId === partId);

            if (already !== undefined)
            {
                if (already.quantity >= ctx.config.maxQuantity)
                {
                    throw new Error(`A line may not ask for more than ${String(ctx.config.maxQuantity)} of one part.`);
                }

                settle(lines.map((line) =>
                {
                    return line.partId === partId
                        ? { ...line, quantity: line.quantity + 1, gone: false }
                        : line;
                }));

                return;
            }

            if (lines.length >= ctx.config.maxLines)
            {
                throw new Error(`A pick list may not run past ${String(ctx.config.maxLines)} lines.`);
            }

            const cents = await Catalog.priceOf(ctx, partId);

            settle([...lines, { partId, name, cents, quantity: 1, gone: false }]);
        },

        drop: (partId: string): void =>
        {
            settle(lines.filter((line) => line.partId !== partId));
        },

        strike: (partId: string): void =>
        {
            if (!Lines.holds(lines, partId))
            {
                return;
            }

            settle(lines.map((line) =>
            {
                return line.partId === partId ? { ...line, gone: true } : line;
            }));
        },

        empty: (): void =>
        {
            settle([]);
        },
    };
};

export type PickingService = ReturnType<typeof createPickingService>;
