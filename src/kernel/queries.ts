import { QueryClient } from "@tanstack/react-query";

export const Queries = {
    create: (): QueryClient =>
    {
        return new QueryClient({
            /* No retry here: the transport already retries, so a second layer
               would multiply the attempts rather than add a chance. */
            defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
        });
    },
};
