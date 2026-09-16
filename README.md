# stack-app

Plugin-based frontend. Every capability is a plugin; the kernel starts them and
enforces the boundaries between them.

## Setting up

```sh
pnpm install
```

The kernel is one package, `@onetype/stack-app-kit`. `package.json` says where
it comes from: a version resolves from npm, a `link:` from a checkout beside
this one, which is how it is developed.

## Running

```sh
pnpm dev              # http://localhost:7380, proxying /api to 7280,
                      # watching the boundaries
pnpm verify           # lint, typecheck, test, build
pnpm test:browser     # opens the app in a real browser and reads the page

PORT=7381 API_PORT=7281 pnpm dev   # an application of your own, on your own api
```

`PORT` is where this application listens and `API_PORT` which server `/api`
reaches, so several people run their own front against their own back with
nothing shared. A port already taken is refused rather than quietly moved to.

`VITE_API_URL` sets the base URL a plugin asks for, and defaults to `/api`;
`VITE_WS_URL` sets the websocket, and without one the transport stays on HTTP.

Nothing stands in for a server. With none running, `/api` answers 404, every
guarded route renders its 403, and the shell says so: the absence is a state
the application shows rather than one it hides. Start `stack-api` on
`API_PORT` and the same code paths reach it unchanged.

`pnpm verify` runs in jsdom, which renders components but runs no build, no
router and no real network. `tests/setup.ts` gives it a `localStorage` that
works, since the one jsdom ships cannot be written to. `pnpm test:browser` opens the built application in
Chromium and reads what a person would see.

## Where to read

`docs.md` is everything: how to add and use a plugin, the exact structure and
why, why plugins at all, and a procedure for each part. It is one file so it
can be read without walking a tree.

No worked example ships yet. `src/plugins/` and `src/utils/` are empty, and
`src/ui/` holds only `index.ts`, which exports nothing: the procedures in
`docs.md` are the only description of a plugin's shape, so read those rather
than looking for code that is not here.

`tools/pack/plugins.mjs`, `tools/pack/ui.mjs` and `tools/pack/utils.mjs` are
where the examples will land when they are written; `tools/pack/docs.mjs`
folds `#docs` the same way. Each folds a folder into one file -- every path and
every line, in the order somebody would read them -- so
`node tools/pack/plugins.mjs unpack` and its siblings rebuild the folders from
it. Until an example is written there is nothing for them to unpack.

The checks that read `#docs` skip while it is folded away. The ones that read
code, which is most of them, run either way.
