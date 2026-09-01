import { z } from "zod";

import { DemoItem } from "./DemoItem";

export const DemoItemPage = {
    schema: z.object({
        items: z.array(DemoItem.schema),
        total: z.number().int().nonnegative(),
    }),
};

export type DemoItemPage = z.infer<typeof DemoItemPage.schema>;
