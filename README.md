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
router and no real network. `pnpm test:browser` opens the built application in
Chromium and reads what a person would see.

## Where to read

`docs.md` is everything: how to add and use a plugin, the exact structure and
why, why plugins at all, and a procedure for each part. It is one file so it
can be read without walking a tree.

`src/plugins/example.txt` is the worked pair, the same way: `documents` stands
alone and opens a slot, `comments` depends on it and fills it. Between them
they use every way across a boundary exactly once, so read one crossing where
it actually runs rather than in a declaration with nothing on the other side.

`comments` also listens on a channel the api pushes to, so a label somebody
else put on shows without anyone asking again.

They also read from two places on purpose: `documents` asks the server through
React Query, and `comments` keeps its drafts in a service a view reads with
`useStore`. The domains are dull on purpose: take the mechanics, never the
model.

Read them where they are.

`src/ui/example.txt` is the same again for the shared layer: one unit, and
tokens named for their role but holding nothing. The names let a stylesheet
read; the empty values impose no palette. Filling them in is the first day's
work.

Each of those files is a folder folded into one: every path and every line,
in the order somebody would read them. Read them where they are.

The checks that read `#docs` skip while it is folded away. The ones that read
code, which is most of them, run either way.
