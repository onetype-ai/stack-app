import { z } from "zod";

export const Beside = {
    schema: z.object({
        id: z.uuid(),
        name: z.string().min(1).max(120),
        cents: z.number().int().nonnegative(),
    }),
};

export type Beside = z.infer<typeof Beside.schema>;
