import { z } from "zod";

import { Line } from "./Line";

export const PickList = {
    schema: z.object({
        lines: z.array(Line.schema),
        cents: z.number().int().nonnegative(),
        items: z.number().int().nonnegative(),
    }),
};

export type PickList = z.infer<typeof PickList.schema>;
