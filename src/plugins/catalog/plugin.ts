import { definePlugin } from "@onetype/stack-app-kit";

import { PartDetail } from "./pages/PartDetail/PartDetail";
import { Parts } from "./pages/Parts/Parts";
import { DepotFrame } from "./sections/DepotFrame/DepotFrame";
import { NoEntry } from "./sections/NoEntry/NoEntry";
import { NoPage } from "./sections/NoPage/NoPage";
import { createPartsService } from "./services/parts";
import { createViewerService } from "./services/viewer";
import { Beside } from "./types/Beside";
import { CatalogConfig } from "./types/CatalogConfig";
import { PartQuery } from "./types/PartQuery";
import { Withdrawal } from "./types/Withdrawal";

export default definePlugin("catalog", {
    version: "1.0.0",

    describe: "What the depot stocks: parts, what each costs, and how many are left.",

    dependsOn: [],

    config: CatalogConfig.schema,

    permissions: {
        "catalog.read": { describe: "See what the depot stocks." },
        "catalog.write": { describe: "Withdraw a part from stock." },
    },

    services: (ctx) =>
    {
        return {
            parts: createPartsService(ctx),
            viewer: createViewerService(ctx),
        };
    },

    grants: (ctx) =>
    {
        return ctx.services.viewer.permissions();
    },

    frame: DepotFrame,

    pages: {
        forbidden: NoEntry,
        missing: NoPage,
    },

    routes: [
        {
            path: "/catalog",
            title: "Stock",
            requires: ["catalog.read"],
            component: Parts,
            search: PartQuery.schema,
        },
        {
            path: "/catalog/parts/$id",
            title: "Part",
            requires: ["catalog.read"],
            component: PartDetail,
        },
    ],

    slots: {
        "catalog.part.aside": {
            describe: "What another plugin shows beside one part, given its number, name and price.",
            schema: Beside.schema,
        },
    },

    emits: {
        "catalog.part.withdrawn": {
            describe: "A part left the shelves. Emitted after the withdrawal was written, never before.",
            schema: Withdrawal.schema,
        },
    },

    hooks: {
        "catalog.part.before-withdraw": {
            describe: "Runs before a part leaves the shelves. Returning a string refuses it with that reason.",
            schema: Withdrawal.schema,
        },
    },

    setup: async (ctx) =>
    {
        await ctx.services.viewer.load();

        ctx.log.info("catalog ready", {
            currency: ctx.config.currency,
            atTheDesk: ctx.services.viewer.current()?.displayName ?? "nobody",
        });
    },

    teardown: (ctx) =>
    {
        ctx.log.info("catalog stopped");
    },
});
