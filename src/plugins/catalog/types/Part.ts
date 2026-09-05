import { z } from "zod";

import { PartKind } from "./PartKind";

export const Part = {
    schema: z.object({
        id: z.uuid(),
        name: z.string().min(1).max(120),
        kind: PartKind.schema,
        cents: z.number().int().nonnegative().max(100_000_000),
        stock: z.number().int().nonnegative(),
    }),
};

export type Part = z.infer<typeof Part.schema>;
