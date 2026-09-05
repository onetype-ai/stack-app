type Part = {
    id: string;
    name: string;
    kind: "fastener" | "seal" | "bearing";
    cents: number;
    stock: number;
    withdrawn: boolean;
};

type Answering = {
    status: number;
    body: unknown;
};

const held: Part[] = [
    { id: "5f1a0a3e-1c2b-4f0a-9a11-000000000001", name: "Hex bolt M8", kind: "fastener", cents: 140, stock: 220, withdrawn: false },
    { id: "5f1a0a3e-1c2b-4f0a-9a11-000000000002", name: "Hex nut M8", kind: "fastener", cents: 60, stock: 480, withdrawn: false },
    { id: "5f1a0a3e-1c2b-4f0a-9a11-000000000003", name: "Washer M8", kind: "fastener", cents: 25, stock: 900, withdrawn: false },
    { id: "5f1a0a3e-1c2b-4f0a-9a11-000000000004", name: "O ring 12mm", kind: "seal", cents: 310, stock: 64, withdrawn: false },
    { id: "5f1a0a3e-1c2b-4f0a-9a11-000000000005", name: "Shaft seal 25mm", kind: "seal", cents: 1450, stock: 18, withdrawn: false },
    { id: "5f1a0a3e-1c2b-4f0a-9a11-000000000006", name: "Gasket sheet A4", kind: "seal", cents: 890, stock: 7, withdrawn: false },
    { id: "5f1a0a3e-1c2b-4f0a-9a11-000000000007", name: "Ball bearing 608", kind: "bearing", cents: 520, stock: 132, withdrawn: false },
    { id: "5f1a0a3e-1c2b-4f0a-9a11-000000000008", name: "Roller bearing 6204", kind: "bearing", cents: 2340, stock: 41, withdrawn: false },
    { id: "5f1a0a3e-1c2b-4f0a-9a11-000000000009", name: "Thrust bearing 51105", kind: "bearing", cents: 3180, stock: 0, withdrawn: false },
];

const viewer = {
    userId: "9c8b7a6d-5e4f-4a3b-8c1d-000000000010",
    displayName: "Depot desk",
    permissions: ["catalog.read", "catalog.write", "cart.use"],
};

const shown = (part: Part) =>
{
    return { id: part.id, name: part.name, kind: part.kind, cents: part.cents, stock: part.stock };
};

const listing = (parameters: URLSearchParams): Answering =>
{
    const kind = parameters.get("kind");
    const open = held.filter((part) => !part.withdrawn);
    const wanted = kind === null || kind === "" ? open : open.filter((part) => part.kind === kind);

    return { status: 200, body: { parts: wanted.map(shown), total: wanted.length } };
};

const one = (id: string): Answering =>
{
    const part = held.find((candidate) => candidate.id === id && !candidate.withdrawn);

    return part === undefined
        ? { status: 404, body: { message: "No part carries that number." } }
        : { status: 200, body: shown(part) };
};

const withdraw = (id: string): Answering =>
{
    const part = held.find((candidate) => candidate.id === id && !candidate.withdrawn);

    if (part === undefined)
    {
        return { status: 404, body: { message: "No part carries that number." } };
    }

    part.withdrawn = true;

    return { status: 200, body: shown(part) };
};

const answer = (path: string, parameters: URLSearchParams, method: string): Answering =>
{
    if (path === "/session")
    {
        return { status: 200, body: viewer };
    }

    if (path === "/catalog/parts" && method === "GET")
    {
        return listing(parameters);
    }

    const detail = /^\/catalog\/parts\/([^/]+)$/.exec(path);

    if (detail !== null)
    {
        const id = decodeURIComponent(detail[1] ?? "");

        return method === "DELETE" ? withdraw(id) : one(id);
    }

    return { status: 404, body: { message: `Nothing here answers ${method} ${path}.` } };
};

/**
 * A depot's stock, answered from memory over fetch.
 *
 * Over fetch rather than beside the transport: a plugin that reached a fake
 * through some other door would be exercising a path it will never take once
 * a server exists.
 */
export const source = {
    install: (baseUrl: string): (() => void) =>
    {
        const passed = globalThis.fetch.bind(globalThis);
        const prefix = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

        globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
        {
            const asked = new URL(
                typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url,
                "http://depot.invalid",
            );

            if (!asked.pathname.startsWith(`${prefix}/`))
            {
                return passed(input, init);
            }

            const answered = answer(
                asked.pathname.slice(prefix.length),
                asked.searchParams,
                (init?.method ?? "GET").toUpperCase(),
            );

            return new Response(JSON.stringify(answered.body), {
                status: answered.status,
                headers: { "Content-Type": "application/json" },
            });
        };

        return () =>
        {
            globalThis.fetch = passed;
        };
    },

    reset: (): void =>
    {
        for (const part of held)
        {
            part.withdrawn = false;
        }
    },
};
