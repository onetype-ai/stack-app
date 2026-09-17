import { QueryClient } from "@tanstack/react-query";

export const Queries = {
    create: (): QueryClient =>
    {
        return new QueryClient({
            defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
        });
    },
};
