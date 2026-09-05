import { z } from "zod";

export const CartConfig = {
    schema: z.object({
        currency: z.string().length(3).default("EUR"),
        maxLines: z.number().int().min(1).max(200).default(20),
        maxQuantity: z.number().int().min(1).max(999).default(99),
    }),
};

export type CartConfig = z.infer<typeof CartConfig.schema>;
