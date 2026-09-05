import { useNavigate, useSearch } from "@tanstack/react-router";

import { PartQuery } from "../types/PartQuery";

import type { PartKind } from "../types/PartKind";

export type ChosenKind = {
    kind: PartKind | undefined;
    choose: (kind: PartKind | undefined) => void;
};

// Kept in the address: a link carries it, a reload keeps it, and back goes
// back to the last filter rather than out of the page.
export const useChosenKind = (): ChosenKind =>
{
    const navigate = useNavigate();
    const raw: unknown = useSearch({ strict: false });
    const query = PartQuery.schema.parse(raw);

    return {
        ...(query.kind !== undefined ? { kind: query.kind } : { kind: undefined }),

        choose: (kind: PartKind | undefined): void =>
        {
            void navigate({ to: "/catalog", search: kind === undefined ? {} : { kind }, replace: true });
        },
    };
};
