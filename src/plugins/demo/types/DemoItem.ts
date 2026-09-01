import { z } from "zod";

import { DemoStatus } from "./DemoStatus";

const allowed = /^[\p{L}\p{N} .,'-]+$/u;

export const DemoItem = {
    schema: z.object({
        id: z.uuid(),
        title: z.string().min(1).max(200),
        status: DemoStatus.schema,
        createdAt: z.iso.datetime(),
    }),

    parseTitle: (raw: string): string =>
    {
        const title = raw.trim();

        if (title.length === 0 || title.length > 200)
        {
            throw new Error(`Title must be 1 to 200 characters. Received ${title.length}.`);
        }

        const offender = Array.from(title).findIndex((character) => !allowed.test(character));

        if (offender !== -1)
        {
            throw new Error(`Title contains an unsupported character at position ${offender + 1}: "${title[offender]}".`);
        }

        return title;
    },
};

export type DemoItem = z.infer<typeof DemoItem.schema>;
