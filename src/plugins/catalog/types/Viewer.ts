import { z } from "zod";

export const Viewer = {
    schema: z.object({
        userId: z.uuid(),
        displayName: z.string().min(1).max(120),
        permissions: z.array(z.string().regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/)).readonly(),
    }),
};

export type Viewer = z.infer<typeof Viewer.schema>;
