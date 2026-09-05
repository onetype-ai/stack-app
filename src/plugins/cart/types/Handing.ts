import { z } from "zod";

import { Bay } from "./Bay";

export const Handing = {
    schema: z.object({ bay: Bay.schema }),
};

export type Handing = z.infer<typeof Handing.schema>;
