import { z } from "zod";

export const DemoConfig = {
    schema: z.object({
        pageSize: z.number().int().min(1).max(100).default(25),
        featureFlag: z.boolean().default(false),
        sessionPath: z.string().min(1).default("/session"),
    }),
};

export type DemoConfig = z.infer<typeof DemoConfig.schema>;
