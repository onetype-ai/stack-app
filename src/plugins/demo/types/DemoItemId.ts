import { z } from "zod";

const schema = z.uuid();

export const DemoItemId = {
    schema,

    parse: (raw: unknown): z.infer<typeof schema> =>
    {
        const parsed = schema.safeParse(raw);

        if (!parsed.success)
        {
            throw new Error(
                `The address does not contain a valid item id. Received ${typeof raw === "string" ? `"${raw}"` : typeof raw}.`,
            );
        }

        return parsed.data;
    },
};

export type DemoItemId = z.infer<typeof schema>;
