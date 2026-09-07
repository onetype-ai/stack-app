# #docs packed

Every file of these documents, one after another. A line starting
with "==> " opens a file and names its path; everything until the next
such line is that file, byte for byte.

Read it here. Nothing needs unpacking, and editing this file directly is work
the next pack throws away.

==> #docs/usage.md

# app

How to write a plugin. `README.md` covers installing and running.

## Your first plugin

Create `src/plugins/<name>/plugin.ts` and export a `definePlugin` result.
Startup finds it; no list to update.

```ts
export default definePlugin("billing", {
    version: "1.0.0",
    describe: "Invoices and payment methods.",
    grants: (ctx) => ctx.services.session.permissions(),
    frame: Shell,
    pages: { forbidden: NoEntry, missing: NoPage },
    routes: [{ path: "/billing", requires: ["billing.read"], component: Invoices }],
});
```

A fresh application has no frame, no 403, no 404 and grants nothing, so the
first plugin declares all four or the router refuses to build and every route
answers 403. One plugin owns each.

Everything it declares is named `plugin.thing`, and one outside its own
namespace is refused. A route requiring another plugin's permission makes them
a dependency: guard your own routes with your own.

Undeclared means absent: the kernel refuses to start, naming the plugin.

## Reaching another plugin

```ts
import { Auth } from "@plugins/auth";
```

A plugin's `index.ts` is the only file another may import, and the plugin must
be in `dependsOn`. Anything deeper is rejected by lint.

For everything else: events, hooks, or a slot — never request-and-response
over the event bus. Filling a slot needs no `dependsOn`; hearing an event or
joining a hook does.

A contribution renders as `({ payload }: { payload: unknown })`, and parses
that payload against the slot's schema.

A route's `search` schema is written back to the address on every navigation,
so a `.default()` in it shows in the URL. Keep those fields optional.

`#docs/procedures/` holds how to build each part; `stack.md` the structure.

==> #docs/architecture.md

# Architecture

Why this shape. The procedures carry the detail.

## The kernel names no plugin, and no plugin names the application

A capability is added and removed in one folder. Nothing central lists what
exists: plugins are discovered from the folder, so a merge that adds one
touches no shared file.

## Undeclared means absent

`plugin.ts` is the whole boundary. The kernel refuses to start rather than
warn, and names the plugin, the key, the owner and the fix. A warning nobody
reads is a defect that ships.

## Four ways to cross, and why they differ

- **Public API** when you need a result now, from a plugin in `dependsOn`.
- **Events** to announce what happened. Nothing comes back, nobody waits.
- **Hooks** to let somebody refuse, by returning a reason.
- **Slots** to hand over a component without knowing who takes it.

The first three read a shape whose owner may change it, so all three name that
owner. A slot does not: it gives, and the payload is checked against a schema.
That difference is what lets a shell frame the plugins that fill it.

Refused: request and response over the event bus, and a method emitting
through someone else's `ctx` — an event carries the identity of the context it
went through.

## Failure is local

Every plugin renders behind its own boundary, and a throwing listener never
reaches the emitter. One plugin failing is one region failing.
## The UI reflects, never decides

A route without permission renders 403. The server is the only place a refusal
counts, so hiding a control is courtesy, never protection.

## Nothing says what code cannot

There are no comments in `src`, stylesheets included, and `Project.checks()`
refuses one. What a comment would have said is a name, or the name of a test
that fails the day it stops being true.

==> #docs/procedures/components.md

# Procedure: components, sections, pages

Three levels. Each composes the one below; none reaches down.

- **component**: smallest unit. Knows no domain.
- **section**: composes components into a block. Knows no page.
- **page**: composes sections, and is the only level that loads data.

A hook is none of them: `hooks/`, one file, named `use…`, renders nothing.

## State

A component keeps what nothing outside can name, a section what it shares, a
page what comes from outside. An effect leaving a section exits through a
callback prop. A level receiving a value as a prop never also stores it —
except a form seeded from a loaded value, which copies it once and then owns
it.

Service-held state reaches a view through `useStore(watch, read)`. Memoise
what `read` answers, or a new object each call re-renders forever.

## Files

One folder per unit, named for it, holding `Name.tsx` and `Name.module.css`. A
hook is one file, no folder. The layer's root `index.ts` is its only entry.

## Markup and styles

The stylesheet roots at `.root`; children are reached through it, never as bare
class names. Variants are classes, state is a `data-` attribute. Names say what
an element is, not how it looks.

Class names come from the module. A bare string is a class nothing declares,
and no check can see it.

## Rules

Every unit handles its empty, loading and error case, or renders nothing on
purpose.

==> #docs/procedures/plugin/boundaries.md

# Procedure: plugin boundaries

Four ways to cross. Pick by what you need back.

## Public API

A result now, from a plugin in `dependsOn`.

```ts
import { Documents } from "@plugins/documents";

const title = await Documents.titleOf(ctx, id);
```

Methods take `ctx` and reach the plugin's services through it, so they run
anywhere. `use()` is the exception, for components.

A component crosses the same way: `DocumentRow` from `@plugins/documents`. A slot lets the opener place
what it never imported; an exported component lets the caller place what it
chose.

A method given someone else's `ctx` must not emit: an event carries the
identity of the context it went through, so the kernel refuses it. Emitting
belongs to the service, which holds its own.

`index.ts` is a plugin's only importable file; one holding nothing but types
and a hook exposes nothing at all.

## Events

Emit only after the state is written: a write and its event must never
disagree. A listener that throws reaches neither the emitter nor the others.
Never request and respond over events: that is a public API with worse types.

## Slots

Nav items, toolbar buttons and settings panels are contributions, never
imports. A contributor needs no `dependsOn` on the opener: it hands over a
component and takes back a payload, so a shell can frame the plugins filling
it. The opener defines that payload's schema; one failing it renders nothing
and answers `problem`, at render rather than at startup.

## Hooks and permissions

The owner runs a lifecycle point and lets others intercept; a participant
rejects by returning a reason. A plugin defines its permissions; anything
guarded references them by key.

Everything crossing is declared in `plugin.ts`. What one plugin uses stays
inside it until a second needs it.

==> #docs/procedures/plugin/contract.md

# Procedure: plugin contract

`plugin.ts` is the whole boundary: undeclared means it does not exist, and
the kernel refuses to start, naming the plugin.

```ts
export default definePlugin("documents", { ... });
```

## Keys, and what is not obvious about them

- `version`, `describe`, `dependsOn`, `config` a schema, `services` a factory,
  `fallback` when it throws.
- `permissions`: those it defines, named `plugin.thing` like everything else.
- `grants`: what the viewer may do, read on every check. One plugin owns it;
  until one does, every guarded route is a 403.
- `frame`, `pages`: the shell, the 403 and the 404. One plugin owns each, and
  without a frame the router refuses to build.
- `routes`: `path` (`$param` segments), `component`, `title?`, `requires?`,
  `search?` a schema for the query string, `instead?` a path they belong at —
  asked before `requires`, so signed out sends to sign in, not a 403.
- `slots`: a record of those it opens, each with a payload schema.
- `contributes`: a list of `{ slot, render, order?, requires? }` — `render`,
  never `component`.
- `emits`, `listens`: a listener that throws stays contained.
- `hooks`, `participates`: a returned string refuses.
- `commands`: a schema and `requires`. `setup` / `teardown` at each end.

## Rules

`services` comes before every key reading `ctx.services`: inference runs left
to right, and a reader above it sees `unknown` — the error names the property,
never the ordering. `ctx.http` answers the body, not an envelope.

Every crossing carries a description and a schema; a payload failing it is
refused. Naming another plugin's event or hook makes it a dependency; filling
its slot does not. Schemas grow only through optional fields; removing one
raises `version`.

==> #docs/procedures/plugin/structure.md

# Procedure: plugin structure

One plugin is one capability: swap it and nothing notices.

```
plugins/<name>/
├── plugin.ts       the contract: all that crosses the boundary
├── index.ts        the public API: methods, components, types
├── types/  utils/  api/  services/  hooks/
├── components/  sections/  pages/
└── tests/
```

No `index.ts` inside a folder: a plugin is private throughout.

## Where code belongs

Stop at the first yes:

1. Describes a value's shape → `types/`, with its schema
2. Knows a backend route → `api/`
3. Needs React state, an effect or a ref → `hooks/`
4. Knows the domain, not the backend → `services/`
5. Pure and domain-free → `utils/`
6. Renders → `components/`, `sections/`, `pages/`

The schema stands outside the object when a method returns that type: a
`const` and a `type` of one name cannot reference each other.

## Shape, per folder

- `types/`: one object holding `schema`, and a type of the same name.
- `api/`, `index.ts`: one object of methods, named for what it reaches.
- `services/`: `createXService(ctx)` returning the object, and its
  `ReturnType` as the type. It closes over `ctx`, so it is a factory.
- `utils/`: a class, exported as one instance.
- `hooks/`: a function `use…`, one per file.

## Style

Allman braces for functions and blocks, arrows included: a named function's
body is a block with a `return`, never one expression. An inline callback stays
as it is. An object's brace stays on the key line. No comments — nothing
enforces this, so it is on you.

`plugin.ts` first, declaring only what it needs; `index.ts` last, the smallest
surface a consumer needs.

==> #docs/procedures/plugin/tests.md

# Procedure: plugin tests

A plugin tests itself in `tests/`, without the application or a server.

- **Services**: what a caller gets back, and what reached the transport.
- **Components**: what a user can see and do, never internal state.
- **Pages**: loading, empty, error and loaded, each rendering its own state.
- **The contract**: that the kernel accepts `plugin.ts`, and refuses a wrong
  declaration.

Test what a schema must reject, not what it takes.

## Fakes

The kit ships one, and no plugin writes its own:

```ts
import { fakeContext } from "@onetype/stack-app-kit/testing";

const fake = fakeContext({ "GET /documents": { documents: [], total: 0 } }, { config });
```

A bare value is a 200 carrying it; `{ status: 204 }` is nothing; `{ status,
body }` refuses the way a server does. It records `asked`, `announced`,
`invalidated` and `commanded`, answers a hook with `fake.refusal`, and refuses
an unanswered path.

Its own tests compare it against the real transport, which is the point: a
fake each plugin wrote drifted and left two hundred tests green over
thirty-nine broken calls. Never reach the network.

It answers no services of its own: spread it and supply them, as
`{ ...fake.ctx, services: { billing } }`; another plugin's go in `offering`.
`asked` records headers too, so a test can prove a closed route was signed.
Booting the real kernel instead, `createKernel` takes `permissions: { granted:
() => [...] }` — the only way past a `requires`.

No shared setup hiding a dependency, no helper wrapping the assertion.

## Proving a test

Break the behaviour: remove the guard, invert the condition, delete the emit.
Watch it fail naming the cause, then put it back. If it stayed green, it tested
nothing. Same for a bug: reproduce it, watch the test fail, then fix it.

==> #docs/procedures/ui-styles.md

# Procedure: ui/styles

Global, unscoped styles. What one component uses is a CSS Module beside it.

## Layers

Order is fixed by `index.css`; a layer may only depend on ones above it.

- `reset.css`: neutralises browser defaults. Removes only, declares nothing,
  and holds the one literal in the layer — it runs before tokens exist.
- `tokens.css`: every design value, as custom properties on `:root`. No selectors.
- `base.css`: bare element appearance. Element selectors only.
- `index.css`: imports only, never a rule.

Whichever plugin owns the frame imports `index.css` once, so an application
with no plugins still builds. Nothing imports a layer directly.

## Where a style belongs

Stop at the first yes:

1. A raw value used by more than one rule → `tokens.css`
2. Every instance of the element should look so without a class → `base.css`
3. Otherwise → a CSS Module beside the component

## Rules

Every value a component sees is a token. The ones that ship are named for
their role — `--example-ink`, `--example-space` — and hold nothing, so no
palette is imposed and nothing renders until you fill them in. Renaming them
and giving them values is the first day's work. A literal colour, length or
duration outside `tokens.css` is a defect.

A token nobody declared is worse than a literal: it resolves to nothing and the
rule quietly does not apply. `Project.checks()` refuses both, and a `styles.x`
no module declares alongside them.

Fonts load in `index.html`, never through CSS; the family name is a token.


==> #docs/stack.md

# Stack

One application, one package: the kernel is `@onetype/stack-app-kit`, and
`package.json` says whether it resolves from npm or from a checkout beside
this one.

## Tools

Vite, React, TanStack Router and Query, CSS Modules, Zod, Vitest. TypeScript
strict, plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.

File-based routing is forbidden: a route that exists because of where a file
sits is a boundary nothing enforces. Routes are declared in a contract.

## Layout

```
src/
├── kernel/     brings the app up: env, mount, queries, routes
├── ui/         shared presentation: styles, components
├── utils/      pure functions no plugin owns
├── plugins/    one folder per capability
└── main.tsx    composition root
```

`ui` imports neither a plugin nor the kernel, and a plugin imports another only
through its `index.ts`. ESLint rejects each. Whether that plugin is one it
declared in `dependsOn` is a contract question, so `Project.checks()` answers
it and the build fails there.

## The kit

Three entries. `.` runs without a DOM: registry, contracts, events, hooks,
slots, permissions, transport. `./react` adds `KernelProvider`, `Slot`,
`RouteGuard`, `usePlugin`, `useStore`, `useEvent` and `StartupFailure` — a
plugin's `index.ts` reaches for this one. `./testing` holds the checks a test
calls, and `fakeContext`.

## Startup

`start` discovers every `plugins/*/plugin.ts`, validates every contract,
resolves dependencies, rejects cycles, and runs `setup` in dependency order.
Any failure stops the boot naming the plugin and the cause.

`services` is declared before anything reading `ctx.services`: inference runs
left to right, so a callback above it sees `unknown`.

`pnpm verify` runs lint, typecheck, tests and build.
