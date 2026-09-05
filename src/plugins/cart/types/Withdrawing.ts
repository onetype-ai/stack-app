import { z } from "zod";

export const Withdrawing = {
    schema: z.object({ id: z.uuid(), name: z.string().min(1).max(120) }),
};

export type Withdrawing = z.infer<typeof Withdrawing.schema>;
