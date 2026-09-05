import { z } from "zod";

const schema = z.string().regex(/^[A-Z]{2}-[0-9]{1,3}$/, "A bay is two capital letters, a hyphen and a number.");

export const Bay = {
    schema,

    parse: (raw: string): z.infer<typeof schema> =>
    {
        const parsed = schema.safeParse(raw.trim().toUpperCase());

        if (!parsed.success)
        {
            throw new Error(`"${raw}" is not a bay. A bay reads like "AC-12".`);
        }

        return parsed.data;
    },
};

export type Bay = z.infer<typeof schema>;
