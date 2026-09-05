# Stack

pnpm workspace. The application is the root; `packages/**` are what it consumes
through `workspace:*`.

## Tools

Vite 8, React 19, TypeScript 6 strict with `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes`. TanStack Router for routes, TanStack Query for
server state, CSS Modules, Zod for schemas, Vitest with Testing Library, ESLint
for boundaries.

Routes are registered programmatically. File-based routing is forbidden: a
route that exists because of where a file sits is a boundary nothing enforces.

## Layout

```
src/
├── kernel/     brings the app up: env, mount, queries, routes
├── ui/         shared presentation: styles, components, sections
├── plugins/    one folder per capability
└── main.tsx    composition root
```

`ui` imports neither a plugin nor the kernel, and a plugin imports another only
through its `index.ts`. ESLint rejects each.

## The kit

`@onetype/stack-app-kit` has three entries. `.` is pure: registry, contracts,
events, hooks, slots, permissions, transport, and runs without a DOM. `./react`
adds `KernelProvider`, `Slot`, `RouteGuard`, `usePlugin` and `StartupFailure`.
`./testing` holds the checks a test calls.

## Startup

`start` discovers every `plugins/*/plugin.ts`, validates every contract,
resolves dependencies, rejects cycles, and runs `setup` in dependency order.
Any failure stops the boot naming the plugin and the cause.

`services` is declared before anything reading `ctx.services`: inference runs
left to right, so a callback above it sees `unknown`.

`pnpm verify` runs lint, typecheck, tests and build. Each check was broken on
purpose to confirm it fails.
