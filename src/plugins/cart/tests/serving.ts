import type { Context } from "@onetype/stack-app-kit";
import type { CartConfig } from "../types/CartConfig";

export type Fake = {
    ctx: Context<CartConfig>;
    priced: string[];
    ran: { command: string; input: unknown }[];
    price: number;
    refuse: string | undefined;
};

// `use` is what a public API reaches through, so faking it is faking the whole
// crossing: a cart that started inventing prices fails here.
export const serving = (config: Readonly<Record<string, unknown>> = {}): Fake =>
{
    const priced: string[] = [];
    const ran: { command: string; input: unknown }[] = [];

    const held: Fake = {
        priced,
        ran,
        price: 140,
        refuse: undefined,
        ctx: undefined as unknown as Context<CartConfig>,
    };

    const catalog = {
        parts: {
            price: (id: string): Promise<number> =>
            {
                priced.push(id);

                return held.refuse === undefined
                    ? Promise.resolve(held.price)
                    : Promise.reject(new Error(held.refuse));
            },
        },
    };

    held.ctx = {
        name: "cart",
        config: { currency: "EUR", maxLines: 20, maxQuantity: 99, ...config },
        services: {},

        log: { debug: () => undefined, info: () => undefined, warn: () => undefined, error: () => undefined },

        http: {
            get: () => Promise.reject(new Error("The cart reaches no server of its own.")),
            post: () => Promise.reject(new Error("The cart reaches no server of its own.")),
            put: () => Promise.reject(new Error("The cart reaches no server of its own.")),
            patch: () => Promise.reject(new Error("The cart reaches no server of its own.")),
            delete: () => Promise.reject(new Error("The cart reaches no server of its own.")),
        },

        cache: { invalidate: () => undefined },

        realtime: {
            channel: () => "http",
            subscribe: () => ({ close: () => undefined }),
        },

        events: { emit: () => undefined, on: () => () => undefined },

        hooks: { run: () => Promise.resolve(undefined) },

        permissions: { has: () => true, all: () => true },

        commands: {
            run: (command, input) =>
            {
                ran.push({ command, input });

                return Promise.resolve();
            },
        },

        use: (plugin: string) =>
        {
            if (plugin !== "catalog")
            {
                throw new Error(`The cart asked for "${plugin}", which it does not depend on.`);
            }

            return catalog as never;
        },
    } as Context<CartConfig>;

    return held;
};
