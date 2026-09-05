# stack-app

Plugin-based frontend. Every capability is a plugin; the kernel starts them and
enforces the boundaries between them.

## Setting up

This repository holds the application only. It consumes one shared package that
lives outside it, linked in rather than committed:

```sh
mkdir -p packages
ln -s /path/to/stack-app-kit packages/stack-app-kit

pnpm install
```

`packages/` is in `.gitignore`, so the link is set up per machine.

## Running

```sh
pnpm dev              # http://localhost:5173
pnpm verify           # lint, typecheck, test, build
```

`VITE_API_URL` sets the backend base URL and defaults to `/api`; `VITE_WS_URL`
sets the websocket, and without one the transport stays on HTTP.

Until something answers that URL there is no session, so no permissions, so
every guarded route renders 403. That is the app working, not a bug.

## Where to read

- `#docs/usage.md`: how to add and use a plugin
- `#docs/stack.md`: the exact structure and why
- `#docs/architecture.md`: why plugins, why a declared boundary
- `#docs/procedures/`: how each part is built

`src/plugins/demo` is the worked example: read it once beside the procedures,
then delete it. Its styles are deliberately plain: take the mechanics, never
the look.

`src/ui` arrives with tokens and eight units: `Button`, `Field`, `Select`,
`Badge`, `Empty`, `Skeleton`, `Spinner`, `Modal`. Anything past those is what
this application needs and no other does.
