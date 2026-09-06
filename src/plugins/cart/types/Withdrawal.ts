import { z } from "zod";

export const Withdrawal = {
    schema: z.object({ id: z.uuid(), name: z.string().min(1).max(120) }),
};

export type Withdrawal = z.infer<typeof Withdrawal.schema>;
