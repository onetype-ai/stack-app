import { QueryClient } from "@tanstack/react-query";

const retriedByTheTransport = false;

export const Queries = {
    create: (): QueryClient =>
    {
        return new QueryClient({
            defaultOptions: { queries: { retry: retriedByTheTransport, staleTime: 30_000 } },
        });
    },
};
