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
| `#docs/stack.md` | what the kit is for, and what `verify` catches |
| `#docs/src/structure.md` | where a file goes |
| `#docs/src/placeholders.md` | what every `<name>` in an example stands for |
| `#docs/src/plugin/` | one procedure a file: what to write, and a skeleton |
| `schemas.md` | the kit's whole surface, generated from its published types |

No worked example ships: `src/plugins/` and `src/utils/` are empty and
`src/ui/index.ts` exports nothing. The procedures are the description of a
plugin's shape.
