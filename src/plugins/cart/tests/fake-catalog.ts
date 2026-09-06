import { definePlugin } from "@onetype/stack-app-kit";
import { z } from "zod";

import type { Plugin } from "@onetype/stack-app-kit";

export type Stocked = {
    id: string;
    name: string;
    kind: "fastener" | "seal" | "bearing";
    cents: number;
    stock: number;
};

export type Depot = {
    granting?: readonly string[];
    price?: () => Promise<number>;
    get?: (id: string) => Promise<Stocked>;
};

// The cart names it in `dependsOn`, so nothing here may be left out: the
// kernel refuses a slot, event or hook no plugin declared, which is what makes
// a stand-in prove anything.
export const fakeCatalog = (held: Depot = {}): Plugin =>
{
    return definePlugin("catalog", {
        version: "1.0.0",
        describe: "A depot standing in for the real one.",

        permissions: {
            "catalog.read": { describe: "See what the depot stocks." },
            "catalog.write": { describe: "Withdraw a part from stock." },
        },

        grants: () =>
        {
            return held.granting ?? ["catalog.read", "catalog.write", "cart.use"];
        },

        services: () =>
        {
            return {
                parts: {
                    price: held.price ?? ((): Promise<number> => Promise.resolve(140)),
                    get: held.get ?? ((): Promise<Stocked> => Promise.reject(new Error("Nothing was stocked for this test."))),
                },
            };
        },

        slots: {
            "catalog.part.aside": {
                describe: "What another plugin shows beside one part.",
                schema: z.object({
                    id: z.uuid(),
                    name: z.string().min(1).max(120),
                    cents: z.number().int().nonnegative(),
                }),
            },
        },

        emits: {
            "catalog.part.withdrawn": {
                describe: "A part left the shelves.",
                schema: z.object({ id: z.uuid(), name: z.string().min(1).max(120) }),
            },
        },

        hooks: {
            "catalog.part.before-withdraw": {
                describe: "Runs before a part leaves the shelves.",
                schema: z.object({ id: z.uuid(), name: z.string().min(1).max(120) }),
            },
        },
    });
};
