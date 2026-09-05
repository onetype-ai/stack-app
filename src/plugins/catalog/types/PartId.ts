import { z } from "zod";

const schema = z.uuid();

export const PartId = {
    schema,

    parse: (raw: unknown): z.infer<typeof schema> =>
    {
        const parsed = schema.safeParse(raw);

        if (!parsed.success)
        {
            throw new Error(
                `The address does not carry a part number. Received ${typeof raw === "string" ? `"${raw}"` : typeof raw}.`,
            );
        }

        return parsed.data;
    },
};

export type PartId = z.infer<typeof schema>;
