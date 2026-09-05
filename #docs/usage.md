# app

Plugin-based frontend. Every capability is a plugin; the kernel starts them and
enforces the boundaries between them.

## Running

```sh
pnpm install
pnpm dev              # http://localhost:5173
pnpm verify           # lint, typecheck, test, build
```

`VITE_API_URL` sets the backend base URL, and defaults to `/api`. Until
something answers it, a plugin that loads a session gets none: no permissions,
so every guarded route renders 403.

## Adding a plugin

Create `src/plugins/<name>/plugin.ts` and export a `definePlugin` result.
Startup finds it: there is no list to update.

```ts
export default definePlugin("billing", {
    version: "1.0.0",
    describe: "Invoices and payment methods.",
    dependsOn: ["auth"],
    routes: [{ path: "/billing", title: "Billing", requires: ["billing.read"], component: Invoices }],
});
```

Undeclared means it does not exist, and the kernel refuses to start naming the
plugin and the cause. See `#docs/procedures/plugin/`.

## Using another plugin

```ts
import { Auth } from "@plugins/auth";
```

A plugin's `index.ts` is the only file another may import, and the plugin must
be in `dependsOn`. Anything deeper is rejected by lint.

For everything else: events, slots or hooks, never a request-and-response over
the event bus.

## Shared UI

```ts
import { Button } from "@ui";
```

`ui` knows no domain and imports no plugin. It arrives empty: `tokens.css` is
the first thing to fill.

`#docs/procedures/` holds how to build each part; `stack.md` the structure.
