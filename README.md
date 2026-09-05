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

There is no server yet, so `src/kernel/source.ts` answers over `fetch`: the
plugins take the same path they will take once one exists. Point
`VITE_API_URL` at a real backend and the stand-in steps aside for every path
it does not hold.

## Where to read

- `#docs/usage.md`: how to add and use a plugin
- `#docs/stack.md`: the exact structure and why
- `#docs/architecture.md`: why plugins, why a declared boundary
- `#docs/procedures/`: how each part is built

`catalog` and `cart` are the worked pair: the first stands alone and opens a
slot, the second depends on it and fills it. Between them they use every way
across a boundary exactly once, so read one crossing where it actually runs
rather than in a declaration with nothing on the other side.

`src/plugins/example.txt` holds them as one file, every path and every line, so
they can be read without walking the tree. `pnpm plugins:unpack` rebuilds the
folders from it; `pnpm plugins:pack` writes them back into it and removes the
folders, so there is one copy rather than two that drift apart. Pack names
other plugins to fold them away the same way: `pnpm plugins:pack billing`.

`src/ui` arrives with tokens and eight units: `Button`, `Field`, `Select`,
`Badge`, `Empty`, `Skeleton`, `Spinner`, `Modal`. Anything past those is what
this application needs and no other does.
