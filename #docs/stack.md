# Stack

Node 22+, TypeScript strict with `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes`. Vite, React 19, TanStack Router and Query, CSS
Modules, Zod, Vitest, ESLint.

One package from npm, `@onetype/stack-app-kit`, with three entries: the root,
`./react` for hooks and components, and `./testing` for what a test uses.

## Running it

```
pnpm dev       vite, on http://localhost:7380
pnpm build     typecheck, then bundle
pnpm verify    lint, typecheck, tests, build
```

`VITE_API_URL` names the server, `VITE_WS_URL` the socket.

## Startup

`main.tsx` builds a query client, `Mount.open` discovers every plugin, and the
kernel validates each contract. Any failure stops the boot naming the plugin
and the cause. Nothing partially starts.

## Fault codes

`kit/9.faultcodes.md` maps every `KernelFault` code to when it fires.
