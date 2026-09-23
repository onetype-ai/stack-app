# Stack

Node 22+, TypeScript strict with `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes`. Vite, React 19, TanStack Router and Query, CSS
Modules, Zod, Vitest, ESLint.

One package, `@onetype/stack-app-kit`, with three entries: the root, `./react`
for hooks and components, `./testing` for what a test uses. `schemas.md` is its
full surface, generated from the published types.

## What the kit is for

A capability is a plugin. A plugin declares what crosses its boundary — routes,
slots, events, permissions, what it contributes to another — and the kernel
refuses at startup anything a contract did not declare. Nothing partially
starts.

Two plugins reach each other only through `index.ts`, and only where
`dependsOn` names the other.

`start` answers the kernel and the router built from what plugins declared, so
an application assembles no route tree of its own.

`pnpm build` writes each `render: "prerender"` route as HTML with its head.

## What verify catches that the compiler cannot

`Project.findAll()` reads the source. One test runs it, and it names a plugin
importing another's internals, a declared field nothing reads, a composition
root importing through a plugin alias, a component copied from a plugin that
exports one, a CSS class or token nothing defines, and an oversized document.

## Errors

A `KernelFault` is a contract mistake, thrown at startup; `StartupFailure`
renders it rather than a blank page. A `TransportFault` is the network. Every
message names the plugin, the thing and the fix.

## What a test runner does not reach

`pnpm verify` runs in jsdom: components render, but no build, no router and no
real network. `pnpm test:browser` opens the application in Chromium and fails
on anything thrown or logged as an error.
