import { z } from "zod";

import { DemoStatus } from "./DemoStatus";

export const DemoListQuery = {
    schema: z.object({
        status: DemoStatus.schema.optional(),
        page: z.number().int().min(1).default(1),
    }),
};

export type DemoListQuery = z.infer<typeof DemoListQuery.schema>;
