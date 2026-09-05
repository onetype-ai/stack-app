import { z } from "zod";

const schema = z.enum(["fastener", "seal", "bearing"]);

export const PartKind = {
    schema,

    label: (kind: z.infer<typeof schema>): string =>
    {
        return { fastener: "Fasteners", seal: "Seals", bearing: "Bearings" }[kind];
    },

    choices: (): readonly { value: z.infer<typeof schema>; label: string }[] =>
    {
        return schema.options.map((kind) =>
        {
            return { value: kind, label: PartKind.label(kind) };
        });
    },
};

export type PartKind = z.infer<typeof schema>;
