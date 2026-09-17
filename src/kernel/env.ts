import { Env as Rules } from "@onetype/stack-app-kit";

export const Env = {
    text: (name: string, fallback?: string): string | undefined =>
        Rules.rules.text(name, import.meta.env[name], fallback),

    required: (name: string): string => Rules.rules.required(name, import.meta.env[name]),
};
