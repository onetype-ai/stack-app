import { z } from "zod";

export const Line = {
    schema: z.object({
        partId: z.uuid(),
        name: z.string().min(1).max(120),
        cents: z.number().int().nonnegative(),
        quantity: z.number().int().min(1),
        gone: z.boolean(),
    }),
};

export type Line = z.infer<typeof Line.schema>;
