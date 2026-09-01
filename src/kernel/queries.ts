import { QueryClient } from "@tanstack/react-query";

export const queries = (): QueryClient =>
    new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
    });
