import { z } from "zod";

import { definePlugin } from "@onetype/stack-app-kit";

import { Dashboard } from "./pages/Dashboard/Dashboard";
import { ItemDetail } from "./pages/ItemDetail/ItemDetail";
import { Settings } from "./pages/Settings/Settings";
import { AppFrame } from "./sections/AppFrame/AppFrame";
import { DemoError } from "./sections/DemoError/DemoError";
import { Forbidden } from "./sections/Forbidden/Forbidden";
import { Missing } from "./sections/Missing/Missing";
import { NavLinks } from "./sections/NavLinks/NavLinks";
import { QuickAction } from "./sections/QuickAction/QuickAction";
import { createItemsService } from "./services/items";
import { createSessionService } from "./services/session";
import { DemoConfig } from "./types/DemoConfig";
import { DemoKeys } from "./utils/DemoKeys";

export default definePlugin("demo", {
    version: "1.0.0",

    describe: "Reference plugin. Uses every kind of boundary crossing exactly once.",

    dependsOn: [],

    config: DemoConfig.schema,

    permissions: {
        "demo.read": { describe: "See demo items and their details." },
        "demo.write": { describe: "Create and remove demo items." },
        "demo.configure": { describe: "Change how this plugin behaves for everyone." },
    },

    services: (ctx) =>
    {
        return {
            items: createItemsService(ctx),
            session: createSessionService(ctx),
        };
    },

    grants: (ctx) =>
    {
        return ctx.services.session.permissions();
    },

    fallback: DemoError,

    frame: AppFrame,

    pages: {
        forbidden: Forbidden,
        missing: Missing,
    },

    routes: [
        { path: "/demo", title: "Items", requires: ["demo.read"], component: Dashboard },
        { path: "/demo/items/$id", title: "Item", requires: ["demo.read"], component: ItemDetail },
        { path: "/demo/settings", title: "Demo settings", requires: ["demo.configure"], component: Settings },
    ],

    slots: {
        "demo.nav": {
            describe: "Primary navigation entries, in ascending order.",
            schema: z.object({}),
        },
        "demo.sidebar": {
            describe: "Blocks shown in the sidebar, in ascending order.",
            schema: z.object({}),
        },
        "demo.toolbar": {
            describe: "Actions shown above the item list.",
            schema: z.object({ label: z.string().min(1).max(40) }),
        },
    },

    contributes: [
        { slot: "demo.nav", order: 10, render: NavLinks },
        { slot: "demo.sidebar", order: 10, requires: ["demo.read"], render: QuickAction },
    ],

    emits: {
        "demo.item.created": {
            describe: "An item was persisted. Emitted after the write, never before.",
            schema: z.object({ id: z.uuid(), createdAt: z.iso.datetime() }),
        },
        "demo.item.deleted": {
            describe: "An item was removed. Emitted after the delete succeeded.",
            schema: z.object({ id: z.uuid() }),
        },
    },

    listens: {
        "demo.item.deleted": {
            describe: "Drops the cached lists so a removed item does not linger in a view.",
            handle: (_payload, ctx) =>
            {
                ctx.cache.invalidate(DemoKeys.items());
            },
        },
    },

    hooks: {
        "demo.item.before-create": {
            describe: "Runs before an item is written. Returning a string rejects it with that reason.",
            schema: z.object({ title: z.string().min(1).max(200) }),
        },
    },

    participates: {
        "demo.item.before-create": {
            describe: "Refuses a title this plugin already holds, so two items never share one.",
            handle: (payload, ctx) =>
            {
                const title = (payload as { title: string }).title;

                return ctx.services.items.seen().some((one) => one.title.trim().toLowerCase() === title.trim().toLowerCase())
                    ? `An item called "${title}" already exists.`
                    : undefined;
            },
        },
    },

    commands: {
        "demo.refresh": {
            describe: "Refetches every demo list currently held in cache.",
            requires: ["demo.read"],
            schema: z.object({}),
            run: (_input, ctx) =>
            {
                ctx.cache.invalidate(DemoKeys.items());
            },
        },
    },

    setup: async (ctx) =>
    {
        await ctx.services.session.load();

        ctx.log.info("demo ready", {
            pageSize: ctx.config.pageSize,
            signedIn: ctx.services.session.current() !== undefined,
        });
    },

    teardown: (ctx) =>
    {
        ctx.log.info("demo stopped");
    },
});
