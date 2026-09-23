# stack-app

Plugin-based frontend. Every capability is a plugin; the kernel starts them and
enforces the boundaries between them.

It starts with no plugins at all, rendering nothing.

## Setting up

```sh
pnpm install
```

## Running

```sh
pnpm dev              # http://localhost:7380, proxying /api to 7280
pnpm build            # typecheck, then bundle
pnpm verify           # lint, typecheck, test, build, browser
pnpm test:browser     # opens the app in Chromium and reads the page
pnpm schemas          # rewrite schemas.md from the installed kit

PORT=7381 API_PORT=7281 pnpm dev   # an application of your own, on your own api
```

`PORT` is where this application listens and `API_PORT` which server `/api`
reaches, so several people run their own front against their own back with
nothing shared. A port already taken is refused rather than quietly moved to.

## Configuration

`VITE_API_URL` sets the base URL a plugin asks for, and defaults to `/api`.
`VITE_WS_URL` sets the websocket; without one the transport stays on HTTP.

Nothing stands in for a server. With none running, `/api` answers 404 and every
guarded route renders its 403: the absence is a state the application shows
rather than one it hides. Start `stack-api` on `API_PORT` and the same code
paths reach it unchanged.

## Where to read

| | |
|---|---|
| `#docs/usage.md` | what this application is: rewrite it first |
| `#docs/architecture.md` | decisions that shape more than one plugin |
| `#docs/stack.md` | what the kit is for, and what `verify` catches |
| `#docs/src/structure.md` | where a file goes |
| `#docs/src/names.md` | the names every example uses |
| `#docs/src/plugin/` | one procedure a file: what to write, and an example |
| `schemas.md` | the kit's whole surface, generated from its published types |

`src/plugins/`, `src/utils/` and `src/ui/` ship empty. The examples live in
`#docs/src/plugin/` only: `items`, and the `layout` it contributes to. Both
were compiled, linted and tested as written, then removed from `src/`.
