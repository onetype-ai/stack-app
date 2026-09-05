import { z } from "zod";

export const CatalogConfig = {
    schema: z.object({
        currency: z.string().length(3).default("EUR"),
        lowStock: z.number().int().min(1).max(1000).default(20),
        sessionPath: z.string().min(1).default("/session"),
    }),
};

export type CatalogConfig = z.infer<typeof CatalogConfig.schema>;
