import { logs } from "@onetype/stack-app-kit";

import { Env } from "./env";

import type { Logger } from "@onetype/stack-app-kit";

export const Log = {
    create: (): Logger => logs.create({ level: Env.level(), write: logs.toConsole }),
};
