import { z } from "zod";

import { Part } from "./Part";

export const PartPage = {
    schema: z.object({
        parts: z.array(Part.schema),
        total: z.number().int().nonnegative(),
    }),
};

export type PartPage = z.infer<typeof PartPage.schema>;
