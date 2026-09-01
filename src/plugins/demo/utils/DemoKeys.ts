import type { DemoListQuery } from "../types/DemoListQuery";

export const DemoKeys = {
    items: () =>
    {
        return ["demo", "items"] as const;
    },

    itemList: (query: Partial<DemoListQuery>, pageSize: number) =>
    {
        return ["demo", "items", "list", { ...query, pageSize }] as const;
    },

    item: (id: string) =>
    {
        return ["demo", "items", "detail", id] as const;
    },
};
