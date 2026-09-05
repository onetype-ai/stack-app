import { Catalog } from "@plugins/catalog";

import type { Context } from "@onetype/stack-app-kit";
import type { CartConfig } from "../types/CartConfig";
import type { Line } from "../types/Line";
import type { PickList } from "../types/PickList";
import { Lines } from "../utils/Lines";

export const createPickingService = (ctx: Context<CartConfig>) =>
{
    let held: readonly Line[] = [];

    const watching = new Set<() => void>();

    let answer: PickList = { lines: [], cents: 0, items: 0 };

    const settle = (next: readonly Line[]): void =>
    {
        held = next;
        answer = { lines: [...next], cents: Lines.cents(next), items: Lines.items(next) };

        for (const told of watching)
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
            watching.add(told);

            return () =>
            {
                watching.delete(told);
            };
        },

        holds: (partId: string): boolean =>
        {
            return Lines.holds(held, partId);
        },

        add: async (partId: string, name: string): Promise<void> =>
        {
            const already = held.find((line) => line.partId === partId);

            if (already !== undefined)
            {
                if (already.quantity >= ctx.config.maxQuantity)
                {
                    throw new Error(`A line may not ask for more than ${String(ctx.config.maxQuantity)} of one part.`);
                }

                settle(held.map((line) =>
                {
                    return line.partId === partId
                        ? { ...line, quantity: line.quantity + 1, gone: false }
                        : line;
                }));

                return;
            }

            if (held.length >= ctx.config.maxLines)
            {
                throw new Error(`A pick list may not run past ${String(ctx.config.maxLines)} lines.`);
            }

            const cents = await Catalog.priceOf(ctx, partId);

            settle([...held, { partId, name, cents, quantity: 1, gone: false }]);
        },

        drop: (partId: string): void =>
        {
            settle(held.filter((line) => line.partId !== partId));
        },

        strike: (partId: string): void =>
        {
            if (!Lines.holds(held, partId))
            {
                return;
            }

            settle(held.map((line) =>
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
