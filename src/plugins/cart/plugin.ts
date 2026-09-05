import { definePlugin } from "@onetype/stack-app-kit";

import { Handover } from "./pages/Handover/Handover";
import { PickedList } from "./pages/PickedList/PickedList";
import { AddToList } from "./sections/AddToList/AddToList";
import { CartTrouble } from "./sections/CartTrouble/CartTrouble";
import { createPickingService } from "./services/picking";
import { CartConfig } from "./types/CartConfig";
import { Handing } from "./types/Handing";
import { Withdrawing } from "./types/Withdrawing";
import { Withdrawn } from "./types/Withdrawn";

export default definePlugin("cart", {
    version: "1.0.0",

    describe: "A pick list: the parts somebody means to pull, at the catalog's prices.",

    dependsOn: ["catalog"],

    config: CartConfig.schema,

    permissions: {
        "cart.use": { describe: "Put parts on a pick list and hand it over." },
    },

    services: (ctx) =>
    {
        return { picking: createPickingService(ctx) };
    },

    fallback: CartTrouble,

    routes: [
        {
            path: "/cart",
            title: "Pick list",
            requires: ["cart.use"],
            component: PickedList,
        },
        {
            path: "/cart/handover",
            title: "Hand over",
            requires: ["cart.use"],
            component: Handover,

            instead: (ctx) =>
            {
                return ctx.services.picking.read().items === 0 ? "/cart" : undefined;
            },
        },
    ],

    contributes: [
        {
            slot: "catalog.part.aside",
            order: 10,
            requires: ["cart.use"],
            render: AddToList,
        },
    ],

    listens: {
        "catalog.part.withdrawn": {
            describe: "Strikes a line whose part left the shelves, so nobody is sent to pull what is gone.",
            handle: (told, ctx) =>
            {
                const gone = Withdrawn.schema.parse(told);

                ctx.services.picking.strike(gone.id);
            },
        },
    },

    participates: {
        "catalog.part.before-withdraw": {
            describe: "Refuses to withdraw a part somebody has already put on a pick list.",
            handle: (asked, ctx) =>
            {
                const part = Withdrawing.schema.parse(asked);

                return ctx.services.picking.holds(part.id)
                    ? `"${part.name}" is on a pick list, so it cannot leave the shelves yet.`
                    : undefined;
            },
        },
    },

    commands: {
        "cart.hand-over": {
            describe: "Hands the pick list to a bay and empties it.",
            requires: ["cart.use"],
            schema: Handing.schema,
            run: (given, ctx) =>
            {
                const asked = Handing.schema.parse(given);
                const list = ctx.services.picking.read();

                if (list.items === 0)
                {
                    throw new Error("An empty pick list has nothing to hand over.");
                }

                ctx.services.picking.empty();

                ctx.log.info("pick list handed over", { bay: asked.bay, items: list.items });
            },
        },
    },

    setup: (ctx) =>
    {
        ctx.log.info("cart ready", { maxLines: ctx.config.maxLines });
    },

    teardown: (ctx) =>
    {
        ctx.log.info("cart stopped", { left: ctx.services.picking.read().items });
    },
});
