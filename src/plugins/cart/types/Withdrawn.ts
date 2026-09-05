import { z } from "zod";

export const Withdrawn = {
    schema: z.object({ id: z.uuid() }),
};

export type Withdrawn = z.infer<typeof Withdrawn.schema>;
