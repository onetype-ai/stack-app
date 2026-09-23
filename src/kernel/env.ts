import { Env as Rules, logs } from "@onetype/stack-app-kit";

import type { logs as Logs } from "@onetype/stack-app-kit";

export const Env = {
    text: (name: string, fallback?: string): string | undefined =>
        Rules.rules.text(name, import.meta.env[name], fallback),

    required: (name: string): string => Rules.rules.required(name, import.meta.env[name]),

    level: (): Logs.Level => Rules.rules.oneOf("VITE_LOG_LEVEL", import.meta.env["VITE_LOG_LEVEL"], logs.levels, "info"),
};
