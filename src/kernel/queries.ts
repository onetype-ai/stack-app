import { QueryClient } from "@tanstack/react-query";

export const Queries = {
    /* No retry: the transport already retries what is worth retrying, and two
       layers doing it multiply into a wait nobody asked for. */
    create: (): QueryClient =>
    {
        return new QueryClient({
            defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
        });
    },
};
