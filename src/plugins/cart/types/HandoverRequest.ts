import { z } from "zod";

import { Bay } from "./Bay";

export const HandoverRequest = {
    schema: z.object({ bay: Bay.schema }),
};

export type HandoverRequest = z.infer<typeof HandoverRequest.schema>;
