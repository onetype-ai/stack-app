# stack-app

Plugin-based frontend. Every capability is a plugin; the kernel starts them and
enforces the boundaries between them.

## Setting up

```sh
pnpm install
```

The kernel is one package from npm, `@onetype/stack-app-kit`. Nothing else is
shared, and nothing is linked.

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

`docs.md` is everything: how to add and use a plugin, the exact structure and
why, why plugins at all, and a procedure for each part. It is one file so it
can be read without walking a tree.

`src/plugins/example.txt` is the worked pair, the same way: `catalog` stands
alone and opens a slot, `cart` depends on it and fills it. Between them they
use every way across a boundary exactly once, so read one crossing where it
actually runs rather than in a declaration with nothing on the other side.

Read them once, then pack them away for good.

`src/ui` arrives with tokens and eight units: `Button`, `Field`, `Select`,
`Badge`, `Empty`, `Skeleton`, `Spinner`, `Modal`. Anything past those is what
this application needs and no other does.

## Packing

Each of those files is a folder folded into one, and folds back:

```sh
pnpm unpack:docs      # docs.md -> #docs/
pnpm unpack:plugins   # example.txt -> the plugin folders
```

`pnpm pack:docs` and `pnpm pack:plugins` fold them back and remove what they
read, so there is one copy rather than two that drift apart. Pack takes names,
so any plugin folds away the same way: `pnpm pack:plugins billing`.

The checks that read the documents skip while they are packed and say which
command brings them back. Unpack before working on what is inside; pack when
you are done.
