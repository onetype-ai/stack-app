import type { PartQuery } from "../types/PartQuery";

export const CatalogKeys = {
    parts: () =>
    {
        return ["catalog", "parts"] as const;
    },

    partList: (query: PartQuery) =>
    {
        return ["catalog", "parts", "list", { ...query }] as const;
    },

    part: (id: string) =>
    {
        return ["catalog", "parts", "detail", id] as const;
    },
};
