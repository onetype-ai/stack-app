# #docs packed

Every file of these documents, one after another. A line starting
with "==> " opens a file and names its path; everything until the next
such line is that file, byte for byte.

Read it here. Nothing needs unpacking, and editing this file directly is work
the next pack throws away.

==> #docs/usage.md

# app

Plugin-based frontend. Every capability is a plugin; the kernel starts them and
enforces the boundaries between them.

## Running

```sh
pnpm install
pnpm dev              # http://localhost:5173
pnpm verify           # lint, typecheck, test, build
```

`VITE_API_URL` sets the backend base URL, and defaults to `/api`. Until
something answers it, a plugin that loads a session gets none: no permissions,
so every guarded route renders 403.

## Adding a plugin

Create `src/plugins/<name>/plugin.ts` and export a `definePlugin` result.
Startup finds it: there is no list to update.

```ts
export default definePlugin("billing", {
    version: "1.0.0",
    describe: "Invoices and payment methods.",
    dependsOn: ["auth"],
    routes: [{ path: "/billing", title: "Billing", requires: ["billing.read"], component: Invoices }],
});
```

Undeclared means it does not exist, and the kernel refuses to start naming the
plugin and the cause. See `#docs/procedures/plugin/`.

## Using another plugin

```ts
import { Auth } from "@plugins/auth";
```

A plugin's `index.ts` is the only file another may import, and the plugin must
be in `dependsOn`. Anything deeper is rejected by lint.

For everything else: events, slots or hooks, never a request-and-response over
the event bus.

## Shared UI

```ts
import { Button } from "@ui";
```

`ui` knows no domain and imports no plugin. Tokens and eight units arrive with
it; a ninth is what this application needs and no other does.

`#docs/procedures/` holds how to build each part; `stack.md` the structure.

==> #docs/architecture.md

# Architecture

## One capability, one plugin

A plugin knows the domain; a package does not. New technology is a new plugin,
never a branch inside an old one.

## Declared or absent

`plugin.ts` is the whole boundary: routes, slots, events, hooks, permissions,
commands, config and dependencies, each described and schema-checked.
Undeclared means absent, and the kernel refuses to start rather than warn.

## Four ways to cross

- **Public API** for a result now, from a plugin in `dependsOn`.
- **Events** to announce what happened. Nothing comes back, nobody waits.
- **Slots** to extend another plugin without importing it.
- **Hooks** to let a participant reject, by returning a reason.

Refused: request and response over the event bus, see `plugin/boundaries.md`;
and a method emitting through someone else's `ctx`, because an event carries
the identity of the context it went through.

## Failure is local

Every plugin renders behind an error boundary. A throwing listener never
reaches the emitter or the others; it is caught, logged and recorded.

## The UI reflects, never decides

Permissions are declared by their owner and checked against whatever source is
registered: today a session, later an account. A route without permission
renders 403, not 404.

## Code is the authority

Plugins are discovered from the folder, not a list. A cross-plugin import is
checked against `dependsOn`, so an undeclared one fails.

Every guarantee here was broken on purpose and watched to fail.

==> #docs/procedures/components.md

# Procedure: components, sections, pages

Three levels. Each composes the one below; none reaches down.

- **component**: smallest unit. Knows no domain.
- **section**: composes components into a self-contained block. Knows no page.
- **page**: composes sections, and is the only level that loads data.

A **hook** is none of them, but behaviour a unit borrows. It lives in `hooks/`,
one per file, named `use…`, returns what the caller renders with, and renders
nothing itself.

## State

A component keeps what nothing outside can name, a section what it shares, a
page what comes from outside. An effect leaving a section exits through a
callback prop. A level receiving a value as a prop never also stores it.

## Files

One folder per unit, named for it, holding `Name.tsx` and `Name.module.css`. A
hook is one file, no folder. The layer's root `index.ts` is its only entry.

## Markup and styles

The stylesheet roots at `.root`; children are reached through it, never as bare
class names. Variants are classes, state is a `data-` attribute. Names say what
an element is, not how it looks.

## Rules

Props in, markup out. No fetching, no global reads, no knowledge of what is
above. Every control is keyboard-operable, visibly focused, and named. Every
unit handles its empty, loading and error case, or renders nothing on purpose.

Prove it by rendering with the smallest legal props, then with everything
supplied, and operating it by keyboard alone.

==> #docs/procedures/plugin/boundaries.md

# Procedure: plugin boundaries

Four ways to cross. Pick by what you need back.

## Public API

A result now, from a plugin in `dependsOn`.

```ts
import { Catalog } from "@plugins/catalog";

const cents = await Catalog.priceOf(ctx, id);
```

Methods take `ctx` and reach the plugin's services through it, so they run
anywhere. `use()` is the exception, for components.

A component crosses the same way: `PartRow` from `@plugins/catalog`. A slot lets the opener place
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
imports. The opener defines the payload schema; one failing it is rejected at
startup.

## Hooks and permissions

The owner runs a lifecycle point and lets others intercept; a participant
rejects by returning a reason. A plugin defines its permissions; anything
guarded references them by key.

Everything crossing is declared in `plugin.ts`. What one plugin uses stays
inside it until a second needs it.

==> #docs/procedures/plugin/contract.md

# Procedure: plugin contract

`plugin.ts` is the whole boundary: undeclared means it does not exist, and the
kernel refuses to start. The name is passed separately, so an error always
names the plugin.

```ts
export default definePlugin("catalog", { ... });
```

## Keys

- `version` raised by a breaking change to a name or payload, `describe` one
  line naming what this owns, `dependsOn` the plugins whose API or permissions
  it uses.
- `config`: a schema, validated at startup. Never a secret.
- `permissions`: those it defines, described. Others use them by key.
- `services`: a factory returning what this plugin runs on.
- `fallback`: rendered when it throws; else the kernel's own.
- `grants`, `frame`, `pages`: what the viewer may do, the shell, and the 403
  and 404. One plugin owns each.
- `routes`: `path`, `title`, `component`, `requires`. Segments use `$param`.
- `slots`: those it opens, with the payload schema contributions get.
- `contributes`: slots in others it fills, with `order` and `requires`.
- `emits`, `listens`: announced and heard, each with a schema. Undeclared
  fails; a listener that throws stays contained.
- `hooks`, `participates`: points this plugin owns and runs, and others' it
  joins. A returned string rejects.
- `commands`: imperative entry points, with a schema and `requires`.
- `setup` / `teardown`: run at start and stop.

## Rules

`services` comes before anything reading `ctx.services`: inference runs left to
right. What `ctx` carries is in this project's `docs.md`.

Every crossing carries a description and a schema, and a payload failing it is
rejected at the boundary. Referencing another plugin's permission makes it a
dependency. Schemas grow only through optional fields; removing one raises
`version`.

==> #docs/procedures/plugin/structure.md

# Procedure: plugin structure

One plugin is one capability: swap it and nothing notices.

```
plugins/<name>/
├── plugin.ts       the contract: all that crosses the boundary
├── index.ts        the public API: methods, components, types
├── types/          one per file, schema and type together
├── utils/          pure functions, no domain
├── api/            the backend, validated
├── services/       the logic, over api and hooks
├── hooks/          one per file: state, effects, refs
├── components/     private
├── sections/       blocks of them
├── pages/          screens
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

Validation lives beside the type it validates. The schema stands outside the
object when a method returns that type: a `const` and a `type` of one name
cannot reference each other in a circle.

## Style

Everything is an object with methods; no loose top-level `const`. A hook is the
exception: React calls it, so it is a function `use…`, one per file.

Allman braces for functions and blocks, arrows included: a named function's
body is a block with a `return`, never one expression. An inline callback stays
as it is. An object's brace stays on the key line. No comments.

`plugin.ts` first, declaring only what it needs; `index.ts` last, the smallest
surface a consumer needs.

==> #docs/procedures/plugin/tests.md

# Procedure: plugin tests

A plugin tests itself in its own `tests/`, without the application or a server,
through the public surface.

- **Services**: what a caller gets back and what reached the transport. Give it
  a fake context; assert on the request made and the value returned.
- **Components and sections**: what a user can see and do, never internal state.
- **Pages**: that loading, empty, error and loaded each render their own state.
- **The contract**: that the kernel accepts `plugin.ts`, and rejects it when a
  declaration is wrong.

Test what a schema must reject, not what it takes.

## Fakes

The context is a fake, not a mock framework. Write one per plugin, giving it
only what the cases need:

- `http` returns canned responses and records every request.
- `events.emit` records instead of dispatching.
- `hooks.run` returns a rejection reason or `undefined`.
- `permissions.has` answers from a list the test controls.

Never reach the network. A fake that accepts what a real one rejects is where
bugs hide.

## Shape

Arrange, act, assert, a blank line between. No shared setup hiding a
dependency, and no helper wrapping the assertion.

## Proving a test

Break the behaviour: remove the guard, invert the condition, delete the emit.
Watch it fail naming the real cause, then put it back. If it stayed green, it
tested nothing. The same for a bug: reproduce it, watch the test fail, then fix
it.

==> #docs/procedures/ui-styles.md

# Procedure: ui/styles

Global, unscoped styles. What one component uses is a CSS Module beside it.

## Layers

Order is fixed by `index.css`; a layer may only depend on ones above it.

- `reset.css`: neutralises browser defaults. Removes only, declares nothing.
- `tokens.css`: every design value, as custom properties on `:root`. No selectors.
- `base.css`: bare element appearance. Element selectors only.
- `utilities.css`: reusable global classes.
- `index.css`: imports only, never a rule.

The app imports `index.css` once, at the entry. Nothing imports a layer
directly.

## Where a style belongs

Stop at the first yes:

1. A raw value used by more than one rule → `tokens.css`
2. Every instance of the element should look so without a class → `base.css`
3. One repeated behaviour across unrelated components → `utilities.css`
4. Otherwise → a CSS Module beside the component

Re-declaring what `base.css` already gives you is a bug.

## Rules

Every value a component sees is a token, named for role, not appearance. A
literal colour, length or duration outside `tokens.css` is a defect.

A token nobody declared is worse than a literal: it resolves to nothing and the
rule quietly does not apply. `Project.checks()` refuses one that names
nothing, and a `styles.x` no module declares alongside it.

A utility is one behaviour, prefixed `ui-`. Prove it needed in two unrelated
places first; one used in a single place is a misfiled module rule.

Fonts load in `index.html`, never through CSS; the family name is a token.

## Proving it

Break a rule and the page must change; nothing moving means it never applied.
Change a token and every consumer must move; one that did not is hardcoded.

==> #docs/stack.md

# Stack

One application, one package. The kernel arrives from npm as
`@onetype/stack-app-kit`; nothing else is linked from next door.

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
through its `index.ts`. ESLint rejects each. Whether that plugin is one it
declared in `dependsOn` is a contract question, so `Project.checks()` answers
it and the build fails there.

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
