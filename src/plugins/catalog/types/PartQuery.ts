import { z } from "zod";

import { PartKind } from "./PartKind";

export const PartQuery = {
    schema: z.object({
        kind: PartKind.schema.optional(),
    }),
};

export type PartQuery = z.infer<typeof PartQuery.schema>;
