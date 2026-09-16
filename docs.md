# #docs packed

Every file of these documents, one after another. A line starting
with "==> " opens a file and names its path; everything until the next
such line is that file, byte for byte.

Read it here. Nothing needs unpacking, and editing this file directly is work
the next pack throws away.

==> #docs/kit/1.context.md

# ctx

What every service, listener, participant and command receives. Built once per
plugin, so a service holds it for the life of the application.

- **Plugin**: `name`, `config`, `log`, `services` its own.
- **Server**: `http.get`, `.post`, `.put`, `.patch`, `.delete`, each taking a
  path and an optional `{ query, body, headers, signal }`.
- **Cache**: `cache.invalidate(key)`, the same key a page passes to `useQuery`.
- **Realtime**: `realtime.subscribe(channel, receive)`, and `channel()` for
  whether a socket or polling is carrying it.
- **Caller**: `permissions.has(key)`, `.all(keys)`, `.changed()` after a
  sign-in, `.watch(notify)` for a component that re-renders on it.
- **Other plugins**: `use(plugin)` another's public API, `events.emit`,
  `events.on`, `hooks.run`, `commands.run`.

```ts
const page = await ctx.http.get("/<name>", { query: { kind } });

await ctx.http.post(`/<name>/${encodeURIComponent(id)}/file`);

ctx.cache.invalidate(<Name>Keys.list());
ctx.events.emit("<name>.<happened>", { id });
```

A write invalidates before it emits, so a listener reading afterwards gets
the new value. `permissions.changed()` after a sign-in, or every guard holds the answer
from before there was one.

Everything is declared in `plugin.ts` first: what is missing there fails
contract validation at startup.

==> #docs/kit/2.definePlugin.md

# definePlugin

`definePlugin(name, contract)`. One default export a plugin, and the only
thing `discover` looks for.

The contract is the whole boundary. `Definition` in the reference names every
field and its type; `plugin.ts` in these documents shows the shape.

==> #docs/kit/2a.composition.md

# Composition

Which pieces an application assembles, in what order, and what each one is for.

## The pieces

Two layers, and they are not the same thing.

The **host** is `boot(log, [...])`. It takes *host plugins* — `kernelPlugin()`,
`routerPlugin(...)`, `cachePlugin(...)`, `transportPlugin(...)`,
`mountPlugin()` — functions the kit exports that wire the kit to itself. Each
carries `needs`, and `boot` orders them:

```
kernelPlugin()     needs: undefined      offers the kernel runtime
transportPlugin()  needs: undefined      offers http and the socket
cachePlugin()      needs: ["kernel"]
routerPlugin()     needs: ["kernel"]
mountPlugin()      needs: ["kernel", "transport"]
```

The **kernel** is `createKernel({ plugins })`. It takes *application plugins* —
what `definePlugin` returns, one a capability. This is the layer every other
document in here is about.

`start({ plugins, transport })` is the one-call path: it boots a host with
`transportPlugin` and builds a kernel, and is enough for an application whose
pages are rendered by something else. **It never builds a router.** For a route
tree you assemble the host yourself, which is what follows.

## An application, from an empty folder

```
package.json
src/
    main.jsx
    shell.plugin.jsx
    notes.plugin.jsx
    audit.plugin.jsx
```

One dependency, `@onetype/stack-app-kit`, with `react`, `react-dom` and `zod`
beside it, and a router library — `@tanstack/react-router` below.

### shell.plugin.jsx — the frame and the status pages

```jsx
import { definePlugin } from "@onetype/stack-app-kit";

const Shell = ({ children }) => <main><h1>App</h1>{children}</main>;
const Missing = () => <p>No such page.</p>;
const Forbidden = () => <p>Not for you.</p>;

export default definePlugin("shell", {
    version: "1.0.0",
    describe: "The frame every page renders inside.",

    frame: Shell,
    pages: { forbidden: Forbidden, missing: Missing },
});
```

At most one plugin declares `frame`, and at most one each of the two pages.

### notes.plugin.jsx — a capability

```jsx
import { definePlugin } from "@onetype/stack-app-kit";
import { Slot, usePlugin } from "@onetype/stack-app-kit/react";
import { z } from "zod";

const Notes = () =>
{
    const { services } = usePlugin("notes");

    return (
        <ul>
            {services.notes.list().map((note) => (
                <li key={note.id}>
                    {note.title}
                    <Slot name="notes.beside-title" payload={{ id: note.id }} />
                </li>
            ))}
        </ul>
    );
};

export default definePlugin("notes", {
    version: "1.0.0",
    describe: "The notes a reader may see.",

    config: z.object({ greeting: z.string().default("Notes") }),

    permissions: { "notes.read": { describe: "See the notes." } },

    services: () => ({ notes: { list: () => [{ id: "n1", title: "First" }] } }),
    grants: () => ["notes.read"],

    slots: {
        "notes.beside-title": { describe: "Beside a note's title.", schema: z.object({ id: z.string() }) },
    },

    emits: {
        "notes.saved": { describe: "A note was written.", schema: z.object({ id: z.string() }) },
    },

    hooks: {
        "notes.before-save": { describe: "Before a note is written.", schema: z.object({ id: z.string() }) },
    },

    commands: {
        "notes.archive": {
            describe: "Put a note out of the way.",
            schema: z.object({ id: z.string() }),
            requires: ["notes.read"],

            run: async (input, ctx) =>
            {
                const refusal = await ctx.hooks.run("notes.before-save", input);

                if (refusal !== undefined)
                {
                    ctx.log.warn(`archive refused: ${refusal}`);

                    return;
                }

                ctx.events.emit("notes.saved", input);
            },
        },
    },

    routes: [
        { path: "/notes", title: "Notes", requires: ["notes.read"], component: Notes },
    ],
});
```

Every declared name — `notes.read`, `notes.beside-title`, `notes.saved`,
`notes.before-save`, `notes.archive` — begins with `notes.`. That is the rule,
below.

### audit.plugin.jsx — reaching into notes

```jsx
import { definePlugin } from "@onetype/stack-app-kit";

const Flag = ({ payload }) => <span> [{payload.id}]</span>;

export default definePlugin("audit", {
    version: "1.0.0",
    describe: "Watches what notes does.",

    dependsOn: ["notes"],

    listens: {
        "notes.saved": { describe: "Records a write.", handle: (payload, ctx) => ctx.log.info(`saved ${payload.id}`) },
    },

    participates: {
        "notes.before-save": {
            describe: "Refuses a note nobody named.",
            handle: (payload) => (payload.id === "" ? "a note needs an id" : undefined),
        },
    },

    contributes: [
        { slot: "notes.beside-title", order: 10, requires: ["notes.read"], render: Flag },
    ],
});
```

`audit` depends on `notes`; `notes` names `audit` nowhere.

### main.jsx — the composition root

```jsx
import { boot, createKernel, kernelPlugin, router, routerPlugin } from "@onetype/stack-app-kit";
import { KernelProvider, RouteGuard } from "@onetype/stack-app-kit/react";
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";

import audit from "./audit.plugin.jsx";
import notes from "./notes.plugin.jsx";
import shell from "./shell.plugin.jsx";

const log = (line, about) => console.log("[host]", line, about ?? "");

// 1. the host. kernelPlugin first: routerPlugin.needs is ["kernel"].
const app = boot(log, [kernelPlugin(), routerPlugin({ createRootRoute, createRoute, createRouter })]);

// 2. the kernel: the plugins this application holds.
const kernel = createKernel({
    plugins: [shell, notes, audit],
    config: { notes: { greeting: "Notes" } },
    grantedBy: "notes",
    log: (level, plugin, line) => console.log(`[${level}] ${plugin}: ${line}`),
});

// 3. validation happens here, not in createKernel.
await kernel.start();

// 4. the tree. This `{ shell, missing }` is Router.build's Frame, not Definition.frame.
const built = router.from(app.host).build(
    kernel,
    { shell: ({ children }) => children, missing: kernel.pages().missing },
    (route) => () => <RouteGuard route={route} />,
);
```

`routerPlugin` takes the three functions of a router library, never imports
one. `router.from(host)` answers `{ build }` or `undefined` — `undefined`
means `routerPlugin` was not in the `boot` array.

`build(kernel, frame, guard)` takes three arguments and answers whatever
`createRouter` returned, typed `unknown`. `guard` is called once a route and
must answer a component: `RouteGuard` is where 403, `instead` and the plugin's
`fallback` happen, so a guard that skips it skips all three.

Rendering it, with the frame the `shell` plugin declared around the page the
router matched:

```jsx
const { Page } = built.render("/notes");   // your router library's matching
const Frame = kernel.frame();

renderToString(
    <KernelProvider kernel={kernel}><Frame><Page /></Frame></KernelProvider>,
);
```

Output:

```
boot order = [ 'kernel', 'router' ]
routes     = [ '/notes' ]
rendered   = <main><h1>App</h1><ul><li>First<span> [<!-- -->n1<!-- -->]</span></li></ul></main>
404        = <p>No such page.</p>
```

The `<span>` is `audit`'s contribution inside `notes`' slot: neither plugin
imports the other. The `<!-- -->` are React's own text separators.

Then the command, the hook and the event, in one call each:

```js
await kernel.run("notes.archive", { id: "n1" });   // [info] audit: saved n1
await kernel.run("notes.archive", { id: "" });     // [warn] notes: archive refused: a note needs an id
```

`kernel.stop()` unwinds the plugins, `app.stop()` the host, in that order.

## Every name begins with its plugin's own

A permission, slot, event, hook or command is `<plugin>.<rest>`, where
`<plugin>` is the name passed to `definePlugin`. This is the first thing
`start()` checks, and a name that breaks it stops the boot:

```
[INVALID_NAME] notes: A permission is named inside its own plugin:
"note.read" belongs to "note", not to "notes". Rename it to "notes.read".
```

Routes are the exception: a path is a path, and only has to start with `/`.

## Hooks and events flow dependent → dependency

The invariant, opposite in direction to `ctx.use`:

- A plugin **runs** only the hooks it **owns**.
- A plugin **participates** in, or **listens** to, a plugin it **depends on**.

So the plugin that declares `participates` is the one that names the owner in
`dependsOn` — `audit` depends on `notes`, above. The owner declares nothing
about the participant, and must not: adding `dependsOn: ["audit"]` to `notes`
so that both sides "know" each other is the trap, and it fails with

```
[DEPENDENCY_CYCLE] audit: Plugins depend on each other in a loop:
audit -> notes -> audit. One of them has to stop.
```

Read `UNDECLARED_DEPENDENCY` as naming the *participant's* missing
`dependsOn`, never the owner's. Running someone else's hook is refused at the
call:

```
[UNDECLARED_HOOK] "audit" ran "notes.before-save", which belongs to "notes".
A plugin runs only the hooks it owns.
```

Two plugins that each want to refuse the other's work are two hooks, one owned
by each, not one hook and a cycle.

## Shapes worth stating once

- `Command.run` receives `(input, ctx)`: the parsed input first, the declaring
  plugin's context second.
- `Definition.frame` is a bare component. The `{ shell, missing }` `Frame` is
  the **second argument to `Router.build`** and nothing else — `shell` wraps
  every page, `missing` is the 404 for a path nothing declared.
- `emits`, `listens`, `hooks`, `participates`, `commands` and `slots` are
  objects keyed by name, never arrays. `listens` and `participates` entries are
  `{ describe, handle }`.
- A plugin never receives its own events. Declaring `emits` and `listens` for
  one name hears nothing.
- `TransportFault` and `address` live on the `transport` namespace —
  `import { transport } from "@onetype/stack-app-kit"`, then
  `transport.TransportFault` — not on the root.
- `createKernel` validates nothing. `await kernel.start()` is what refuses, so
  a contract mistake surfaces there.

==> #docs/kit/3.react.md

# @onetype/stack-app-kit/react

What a component reaches for. Imported from `/react`, never the root.

- `usePlugin<Config, Services>(name)` answers this plugin's handle: `config`,
  `services`, `permissions`. A plugin's `index.ts` wraps it as `use()`.
- `useKernel()` answers the kernel itself, for a frame or a guard.
- `useEvent(listener, event, handle)` subscribes for as long as the component
  lives, and unsubscribes on unmount. `listener` is the plugin doing the
  listening, not the one that owns the event.
- `useStore(watch, read)` re-renders on a value outside React, such as
  `ctx.permissions.watch`.
- `useFrame()` answers the frame the routed plugin declared.
- `<Slot name payload />` renders what other plugins contributed to a slot.
- `<KernelProvider kernel>` wraps the tree; `main.tsx` is its only caller.
- `<StatusPageProvider pages>` replaces the 403 and 404 for the whole app.
- `<NotFound />`, `<StartupFailure message />`, `<RouteGuard route send />`.

```tsx
const { services, config } = <Name>.use();

useEvent("<other>", "<other>.<happened>", (payload) => { ... });
```

A hook is called at the top of a component, never in a branch. `useEvent`'s
first argument is the plugin whose context subscribes — the listener — and it
must name the event's owner in `dependsOn`. A component of `<other>` hearing
`<name>.<happened>` passes `"<other>"`, not `"<name>"`.

==> #docs/kit/4.slots.md

# Slots

How one plugin renders inside another without either importing the other.

The owner declares the slot and what a contribution is given:

```ts
slots: {
    "<name>.<place>": { describe: "<what appears here>", schema: <Payload>.schema },
},
```

Another plugin contributes to it:

```ts
contributes: [
    { slot: "<other>.<place>", order: 10, requires: ["<name>.read"], render: <Name>Link },
],
```

The owner renders every contribution at once:

```tsx
<Slot name="<name>.<place>" payload={{ id, title }} />
```

`order` decides the sequence, low first. `requires` hides a contribution from a
reader who may not see it. `render` receives `{ payload }`, parsed against the
owner's schema.

A slot nothing contributes to renders nothing. A contribution to a slot nobody
declared fails contract validation at startup, naming both plugins.

==> #docs/kit/5.realtime.md

# Realtime

`ctx.realtime.subscribe(channel, receive)` returns `{ close }`. The transport
carries it over a socket where one opened, and polls where it did not:
`ctx.realtime.channel()` answers `"ws"` or `"http"`.

```ts
const held = ctx.realtime.subscribe("<name>.<thing>", (message) =>
{
    ctx.cache.invalidate(<Name>Keys.list());
});

held.close();
```

A message invalidates rather than writes: the cache refetches, and one shape
comes from the server instead of two from the server and the socket.

`setup` subscribes and `teardown` closes. A component subscribing directly
leaks on unmount.

==> #docs/kit/6.routes.md

# Routes

A plugin declares its own paths. Nothing central lists them, and two plugins
claiming one path fails contract validation at startup.

```ts
routes: [
    {
        path: "/<name>",
        title: "<what the tab says>",
        requires: ["<name>.read"],
        component: <Name>s,
        search: <Name>Query.schema,
        instead: (ctx) => ctx.services.<subject>.ready() ? undefined : "/<other>",
    },
],
```

`path` follows TanStack Router: `$id` is a parameter, reached with
`useParams`. `search` parses the query string, so a reader typing anything into
the address reaches a value the schema checked.

`requires` renders the 403 page instead. `instead` redirects: returning a path
sends the reader there, `undefined` lets them through.

A `requires` naming a permission no plugin declared fails validation, and so
does a `requires` where no plugin declares `grants` at all — a route every
reader is refused looks the same from outside as a route that works. A plugin
that declares `grants` and returns `[]` passes: the kernel checks that someone
answers, not that the answer is ever yes.

`title` names the browser tab, set before the guard runs: a reader refused a
page is on that page.

==> #docs/kit/7.faults.md

# Faults

Three, and each says whose mistake it was.

- `KernelFault` — a contract is wrong. Thrown at startup, naming the plugin
  and the field. Nothing renders.
- `TransportFault` — a call failed. `code` is `NETWORK`, `TIMEOUT`,
  `ABORTED`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`,
  `RATE_LIMITED`, `SERVER`, `CLIENT` or `MALFORMED`.
- `BootFault` — a plugin failed to boot. `NO_NAME`, `NO_BOOT`,
  `REGISTERED_TWICE`, `UNKNOWN_NEED`, `CYCLE`, `OFFERED_TWICE`, `NO_API`.

```ts
if (cause instanceof TransportFault && cause.code === "CONFLICT")
{
    return "<what the reader may do about it>";
}
```

A page that throws reaches the plugin's `fallback`, given `{ error, plugin,
reset }`. Without one, the whole tree unmounts: declare it.

`fallback` is a React error boundary, so it catches only while rendering in a
browser. Under `renderToString` a throw is not caught by anything: it comes out
of the render call, and the caller handles it or the response is lost.

Branch on `code`, never on the message. A message is for a reader.

==> #docs/kit/8.events.md

# Events, hooks and commands

Three ways one plugin reaches another without importing it.

## Events

The owner declares what it emits; anyone may listen.

```ts
emits: { "<name>.<happened>": { describe, schema } },
listens: { "<other>.<happened>": { describe, handle: (payload, ctx) => { ... } } },
```

Emitted after the work, never before. A listener returns nothing and cannot
refuse. `useEvent(listener, event, handle)` is the same subscription in a
component, where `listener` is the plugin doing the listening. A plugin never
receives its own events: declaring `emits` and `listens` for one name hears
nothing.

## Hooks

The owner declares a point where another plugin may refuse.

```ts
hooks: { "<name>.before-<doing>": { describe, schema } },
participates: { "<other>.before-<doing>": { describe, handle } },
```

A participant returns a string to reject, or nothing to allow. The owner runs
`ctx.hooks.run(hook, payload)` and receives the first refusal.

## Commands

An entry point with no route: another plugin calls it, and it declares what
holding it requires.

```ts
commands: { "<name>.<do-thing>": { describe, schema, requires, run } },
```

Reached with `ctx.commands.run("<name>.<do-thing>", input)`. The method is
`run`, not `handle`.

==> #docs/kit/testing/1.faking.md

# fakeContext

`fakeContext(answers, faking)` builds a `ctx` a test drives, and records
everything that crossed it.

```ts
const fake = fakeContext({ "GET /<name>": { <name>s: [<thing>], total: 1 } }, {
    config,
    permissions: ["<name>.read"],
    refusal: "<what a participant refuses with>",
});
```

`answers` is keyed `"<METHOD> <path>"`. A path with no answer throws, so a call
nobody expected is a failing test rather than `undefined`.

What it records:

- `fake.requests` — every call, as `{ method, path, query, body, headers }`.
  `query`, `body` and `headers` are absent where the call passed none.
- `fake.announced` — every event, as `{ event, payload }`.
- `fake.invalidated` — every cache key.
- `fake.commanded` — every command, as `{ command, input }`.
- `fake.logged` — every line, as `{ level, line }`.
- `fake.regranted` — how many times `permissions.changed()` was called.
- `fake.push(channel, message)` — delivers to whatever subscribed.

`Faking` in the reference names every option. Assert on `fake.requests` rather
than a mock: what the server was asked is the contract.

==> #docs/src/kernel/kernel.md

# kernel/

What this project decides about itself, before any plugin runs.

```
env.ts       what the environment carries, parsed once and refused early
mount.ts     discovery and start: the only caller of the kit's `start`
queries.ts   the query client every plugin's cache is built from
routes.tsx   the router, built from what the kernel registered
index.ts     what main.tsx reaches
```

`Mount.open(client)` passes `plugins`, `cache` and `transport`. A plugin
receives `ctx.config` keyed by its own name, and `ctx.http`; reaching past
them ties a capability to this one deployment.

Edited when the project changes shape: an environment variable, a base url,
somewhere else to find plugins. A capability is never added here — that is a
plugin, and adding one touches no file in this folder.

==> #docs/src/plugin/1.index.ts.md

# index.ts

The public API: the only file another plugin may import, and only when it
names this one in `dependsOn`. Everything else in the folder is private.

`<Name>` is the plugin's folder capitalised.

```ts
import { usePlugin } from "@onetype/stack-app-kit/react";

import type { Context } from "@onetype/stack-app-kit";
import type { PluginHandle } from "@onetype/stack-app-kit/react";
import type { <Name> } from "./services/<name>";
import type { <Thing> } from "./types/<Thing>";

export type <Name>Services = { <subject>: <Name> };

export type <Name>Handle = PluginHandle<<Name>Config, <Name>Services>;

const servicesOf = (ctx: Context) => ctx.use<<Name>Services>("<name>");

export const <Name> = {
    use: (): <Name>Handle => usePlugin<<Name>Config, <Name>Services>("<name>"),

    get: (ctx: Context, id: string): Promise<<Thing>> =>
    {
        return servicesOf(ctx).<subject>.get(id);
    },
};

export { <Name>Row } from "./components/<Name>Row/<Name>Row";
export type { <Thing> } from "./types/<Thing>";
```

`use()` is for a component, `get(ctx, ...)` for anything holding a `ctx`. A
component this plugin exports is shown the same way wherever it appears.

==> #docs/src/plugin/10.hooks.hook.ts.md

# hooks/

`use<Name>.ts`, one hook a file. What a page needs from React that a service
cannot hold: the address, focus, a timer.

A hook reads and writes the address through TanStack Router, so the query
string is the state and a reload lands where the reader was.

```ts
import { useNavigate, useSearch } from "@tanstack/react-router";

import { <Thing>Query } from "../types/<Thing>Query";

import type { <Thing>Kind } from "../types/<Thing>Kind";

export type <Kind>InAddress = {
    kind: <Thing>Kind | undefined;
    choose: (kind: <Thing>Kind | undefined) => void;
};

export const use<Kind>InAddress = (): <Kind>InAddress =>
{
    const navigate = useNavigate();
    const search: unknown = useSearch({ strict: false });
    const query = <Thing>Query.schema.parse(search);

    return {
        kind: query.kind,

        choose: (kind: <Thing>Kind | undefined): void =>
        {
            void navigate({ to: "/<name>", search: kind === undefined ? {} : { kind }, replace: true });
        },
    };
};
```

The search is parsed, never read raw: a reader may type anything into the
address. `replace: true` keeps the back button meaningful.

==> #docs/src/plugin/11.utils.util.ts.md

# utils/

The same rule as `#docs/src/utils/utils.ts.md`, reachable by this plugin
alone.

`<Name>Keys.ts` is the one every plugin has: a page reads a key to fetch, and a
service reads the same key to invalidate.

==> #docs/src/plugin/12.tests.test.ts.md

# tests/

`<name>.test.ts` for a service, `<name>.test.tsx` for anything rendered. Flat,
one subject a file.

Only the outermost thing is tested: the service, the section, the exported
component. A hook has no test of its own; the page using it does. Every
refusal in `usage.md` has one that triggers it.

## A service

`fakeContext(answers, faking)` builds a `ctx` that answers a path with a
value, and records what was asked, emitted, invalidated and run.

```ts
import { fakeContext } from "@onetype/stack-app-kit/testing";

const fake = fakeContext({ "GET /<name>": { <name>s: [<thing>], total: 1 } }, { config });

await new <Name>(fake.ctx).list();

expect(fake.requests).toEqual([{ method: "GET", path: "/<name>" }]);
```

## Anything rendered

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

render(<<Name>Table <name>s={[<thing>]} onOpen={opened} />);

await userEvent.click(screen.getByRole("link", { name: "<title>" }));

expect(opened).toHaveBeenCalledWith(<thing>.id);
```

A query is asserted through `fake.requests`, a render through the role a reader
would use. Never a class name: a stylesheet may change without the meaning
changing.

Write it, break the code it covers, confirm it fails naming the cause, then
restore. A test that has never failed proves nothing.

==> #docs/src/plugin/13.styles.module.css.md

# Name.module.css

One stylesheet a component, beside it in the same folder. CSS Modules, so a
class name is local and two plugins may both write `.root`.

Every length, colour, radius and duration is a token from `@ui`. A literal is
a lint error, and `Project.findAll()` names the file and the value.

```css
.root
{
    display: grid;
    gap: var(--example-space);
    padding: var(--example-space) var(--example-gutter);
    border-bottom: var(--example-hairline) solid var(--example-edge);
}

.root .name
{
    overflow: hidden;
    color: var(--example-ink);
    font-weight: var(--example-strong);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.root[data-length="long"] .length
{
    color: var(--example-warn);
}
```

State is an attribute, never a second class: `data-length`, `data-open`,
`aria-busy`. A test asserts on the attribute, and a screen reader announces what the
stylesheet renders.

==> #docs/src/plugin/2.plugin.ts.md

# plugin.ts

The contract: everything crossing the boundary, named here or absent. The
kernel refuses to start when a declaration is missing.

`<Name>` is the folder capitalised, `<subject>` the service it holds.

Required: `version`, `describe`.

```ts
export default definePlugin("<name>", {
    version: "1.0.0",
    describe: "<what this plugin is for>",

    dependsOn: ["<other>"],
    config: <Name>Config.schema,

    permissions: { "<name>.read": { describe: "<what it allows>" } },

    // services before grants: TypeScript infers this object in order, so a
    // grants written above it reads ctx.services as unknown.
    services: (ctx) => ({ <subject>: new <Name>(ctx) }),
    grants: (ctx) => ctx.services.<subject>.permissions(),

    frame: <Name>Frame,
    pages: { forbidden: NoEntry, missing: NoPage },

    routes: [
        { path: "/<name>", title: "<Tab>", requires: ["<name>.read"],
          component: <Name>s, search: <Name>Query.schema },
        { path: "/<name>/$id", title: "<Tab>", component: <Name>Detail },
    ],

    slots: { "<name>.<place>": { describe, schema } },
    contributes: [{ slot: "<other>.<place>", render: <Name>Link }],

    emits: { "<name>.<happened>": { describe, schema } },
    listens: { "<other>.<happened>": { describe, handle } },
    hooks: { "<name>.before-<doing>": { describe, schema } },
    participates: { "<other>.before-<doing>": { describe, handle } },
    commands: { "<name>.<do-thing>": { describe, schema, requires, run } },

    sends: (ctx) => ({ "x-<name>": ctx.config.<field> }),
    fallback: <Name>Broke,

    setup: (ctx) => ctx.log.info("<name> ready"),
    teardown: (ctx) => ctx.log.info("<name> stopped"),
});
```

`frame` wraps every page this plugin routes. `pages` replaces the 403 and 404
for them. `fallback` renders when one throws.

==> #docs/src/plugin/3.usage.md.md

# usage.md

What another developer reads before building against this plugin.

`<name>` is the folder, exactly as the contract names it.

```md
# <name>

## Description

<what it is, in a sentence or two: what it holds and who may see it>

## Usage

<the two or three calls another plugin makes, as code>

## What it declares

- **Permissions**: <each one, and what holding it allows>
- **Routes**: <each path, and what it shows>
- **Slots**: <each slot, and what a contribution renders>
- **Events**: <each one, and when it fires>

## Refusals

- <every refusal, one a line, each with a test that triggers it>

## Does not

- <what another plugin owns, so a reader does not wait on this one>
```

==> #docs/src/plugin/4.types.type.ts.md

# types/

Everything zod parses, and the shapes describing code alone. `<Thing>.ts`
holds `<Thing>`, as a `const` and a `type` of one name.

A value crossing the boundary carries a schema. A shape the code needs and no
server receives carries none.

```ts
import { z } from "zod";

import { <Other> } from "./<Other>";

export const <Thing> = {
    schema: z.object({
        id: z.uuid(),
        <field>: <Other>.schema,
    }),

    <method>: (raw: <Thing>): string =>
    {
        return <raw, made regular>;
    },
};

export type <Thing> = z.infer<typeof <Thing>.schema>;
```

`<Name>Config.ts` holds what `plugin.ts` names in `config`, and is what
`ctx.config` resolves to. A secret belongs on the server: nothing here reaches
the browser without shipping in the bundle.

==> #docs/src/plugin/5.api.api.ts.md

# api/

Every call to the server, one file a surface. The only place a path is
written, and the only place a response is parsed.

`ctx.http` carries the call; `fetch` is a lint error. A response is parsed
before it is returned, so a service holds a value the schema already checked.

```ts
import type { Context } from "@onetype/stack-app-kit";

import { <Thing> } from "../types/<Thing>";
import type { <Thing>Query } from "../types/<Thing>Query";

export const <name>Api = {
    list: async (ctx: Context, query: <Thing>Query): Promise<<Thing>Page> =>
    {
        const body = await ctx.http.get("/<name>", { query });

        return <Thing>Page.schema.parse(body);
    },

    one: async (ctx: Context, id: string): Promise<<Thing>> =>
    {
        const body = await ctx.http.get(`/<name>/${encodeURIComponent(id)}`);

        return <Thing>.schema.parse(body);
    },
};
```

`encodeURIComponent` on every id: one carrying a slash otherwise reads as
another path. A 4xx or 5xx throws, and the kit names which.

==> #docs/src/plugin/6.services.service.ts.md

# services/

One class a file, built once per plugin and handed `ctx`. Everything a page
or a section needs, and the only holder of state between renders.

A service calls `api/`, never the server. It parses nothing: the api already
did. `fetch` is a lint error here too.

```ts
import type { Context } from "@onetype/stack-app-kit";

import { <name>Api } from "../api/<name>";
import { <Name>Keys } from "../utils/<Name>Keys";
import type { <Thing> } from "../types/<Thing>";

export class <Name>
{
    readonly #ctx: Context;

    readonly #known = new Map<string, <Thing>>();

    constructor(ctx: Context)
    {
        this.#ctx = ctx;
    }

    cached(id: string): <Thing> | undefined
    {
        return this.#known.get(id);
    }

    async get(id: string): Promise<<Thing>>
    {
        return this.#remember(await <name>Api.one(this.#ctx, id));
    }

    async <method>(id: string): Promise<void>
    {
        await <name>Api.<method>(this.#ctx, id);

        this.#ctx.cache.invalidate(<Name>Keys.list());
        this.#ctx.events.emit("<name>.<happened>", { id });
    }

    #remember(<thing>: <Thing>): <Thing>
    {
        this.#known.set(<thing>.id, <thing>);

        return <thing>;
    }
}
```

A write invalidates the cache keys it changed, then emits. `utils/<Name>Keys`
holds every key, so a page and a service cannot disagree.

==> #docs/src/plugin/7.pages.page.tsx.md

# pages/

The same shape as `#docs/src/ui/page.md`, one folder a route. What `plugin.ts`
names in `routes`.

==> #docs/src/plugin/8.sections.section.tsx.md

# sections/

One folder a composed piece: `<Name>/<Name>.tsx` with its own module.css.
What a page puts together, and what `frame` and `pages` name.

A section may reach this plugin's services and another plugin's public API. It
takes what it renders as props wherever a page already holds it, so the same
section serves two pages.

```tsx
import { <Other> } from "@plugins/<other>";

import { <Name>Row } from "../../components/<Name>Row/<Name>Row";
import styles from "./<Name>Table.module.css";

import type { <Thing> } from "../../types/<Thing>";

export type <Name>TableProps = {
    <name>s: readonly <Thing>[];
    loading?: boolean;
    onOpen?: ((id: string) => void) | undefined;
};

export const <Name>Table = ({ <name>s, loading, onOpen }: <Name>TableProps) =>
{
    if (loading === true)
    {
        return <p className={styles.waiting}>Loading…</p>;
    }

    return (
        <ul className={styles.root}>
            {<name>s.map((<thing>) => (
                <<Name>Row key={<thing>.id} <thing>={<thing>} onOpen={onOpen} />
            ))}
        </ul>
    );
};
```

`Slot` renders what other plugins contributed: `<Slot name="<name>.<place>"
payload={...} />`, and each contribution declares what it needs.

==> #docs/src/plugin/9.components.component.tsx.md

# components/

The same shape as `#docs/src/ui/component.md`, reachable by this plugin alone
unless `index.ts` exports it.

A component a plugin exports is shown the same way wherever it appears, so a
row looks alike on its own page and inside another plugin's slot.

==> #docs/src/structure.md

# Procedure: src structure

## The tree

```
src/
├── main.tsx        composition root
├── kernel/         env, mount, queries, routes
├── plugins/        one folder a capability
├── ui/             presentational, no domain
└── utils/          pure, no domain
```

Nothing central lists the plugins: adding one touches no file above it.

## Inside a plugin

`*` kernel requires it.

```
plugins/<name>/
├── plugin.ts *     one default export
├── usage.md *      under 1800 characters
├── index.ts        one exported object
├── types/          Name.ts, one type a file
├── api/            name.ts, one server surface a file
├── services/       name.ts, one class a file
├── pages/          Name/Name.tsx, one route a folder
├── sections/       Name/Name.tsx, composed, reaches services
├── components/     Name/Name.tsx, presentational only
├── hooks/          useName.ts, one hook a file
├── utils/          Name.ts, one class a file
└── tests/          name.test.ts, flat
```

Every `.tsx` folder holds its own `Name.module.css` beside it.

==> #docs/src/ui/component.md

# A component

One folder a unit: `<Name>/<Name>.tsx` and `<Name>.module.css` beside it. The
same shape whether it lives in `src/ui` or in a plugin's `components/`.

Props in, markup out. No service, no plugin, no hook that reads the address,
and `fetch` is a lint error. Everything shown arrives as a prop, so the same
unit serves a page, a section and a test.

```tsx
import { useId, useRef } from "react";

import { useFocusTrap } from "@onetype/stack-app-kit/react";

import styles from "./<Name>.module.css";

import type { ReactNode } from "react";

export type <Name>Tone = "plain" | "accent" | "alarm";

export type <Name>Props = {
    title: string;
    tone?: <Name>Tone;
    busy?: boolean;
    onDismiss?: () => void;
    children?: ReactNode;
    trailing?: ReactNode;
};

export const <Name> = ({ title, tone = "plain", busy = false, children, trailing }: <Name>Props) =>
{
    const id = useId();

    return (
        <section
            className={styles.root}
            data-tone={tone}
            data-busy={busy || undefined}
            aria-labelledby={id}
            aria-busy={busy || undefined}
        >
            <h2 id={id} className={styles.title}>{title}</h2>
            {children}
            {trailing}
        </section>
    );
};
```

`data-tone` and `data-busy` carry state, so the stylesheet reads an attribute
rather than a second class. `aria-labelledby` and `aria-busy` say the same
thing to a screen reader, and a test asserts on the role.

`trailing` and `children` are how a caller adds to a unit without it knowing
what: the unit places, the caller decides.

==> #docs/src/ui/page.md

# A page

One folder a route: `<Name>/<Name>.tsx` and `<Name>.module.css` beside it.
Only a plugin has them; `src/ui` holds none, because a page carries domain.

A page reads the address, calls a service through `useQuery`, and composes
sections. It holds no markup of its own beyond layout.

```tsx
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { <Name> as Plugin } from "../../index";
import { <Name>Table } from "../../sections/<Name>Table/<Name>Table";
import { <Name>Keys } from "../../utils/<Name>Keys";
import styles from "./<Name>s.module.css";

export const <Name>s = () =>
{
    const { services, config } = Plugin.use();
    const navigate = useNavigate();

    const page = useQuery({
        queryKey: <Name>Keys.list({}),
        queryFn: () => services.<subject>.list(),
    });

    return (
        <div className={styles.root}>
            {page.isError
                ? <p className={styles.wrong} role="alert">{page.error.message}</p>
                : (
                    <<Name>Table
                        <name>s={page.data?.<name>s ?? []}
                        loading={page.isPending}
                        onOpen={(id) => { void navigate({ to: "/<name>/$id", params: { id } }); }}
                    />
                )}
        </div>
    );
};
```

`queryKey` comes from `utils/<Name>Keys`, the same file a service invalidates
through, so a stale list cannot survive a write.

An error renders where the reader is, with `role="alert"`. A page that throws
instead reaches the plugin's `fallback`.

==> #docs/src/ui/ui.md

# ui/

The presentational layer every plugin may reach: units, tokens and the reset.
It holds no domain and imports no plugin.

The scaffold ships `index.ts` and nothing else. The layout below is what to
build, in the order a first screen needs it.

```
ui/
├── index.ts                    what `@ui` exports
├── components/Name/Name.tsx    one unit a folder, with its own module.css
└── styles/                     the reset, the tokens, the base
```

Reached as `@ui` for a unit and `@ui/styles/...` for a stylesheet, both mapped
in `tsconfig.base.json` and `vite.config.ts`. A path that resolves to nothing
is reported by `Project.findAll()` before the first import of it.

`component.md` and `page.md` beside this file hold the shape each takes. A
plugin's `components/` and `pages/` follow them.

A token is named for its role, never its value, so a stylesheet reads and the
palette stays one file.

Every length, colour and duration in a plugin's stylesheet is a token. A
literal is a lint error: `Project.findAll()` names the file and the value.

==> #docs/src/utils/utils.ts.md

# utils/

A class of methods any plugin may reach: `plugin.ts`, `index.ts`, a service, a
section, a component. Exported as a singleton, so a caller never constructs
one.

It takes values and returns values. Reaching a plugin, the kit or `@ui` is a
lint error: needing `ctx` means it is a service.

```ts
class <Name>Utils
{
    <method>(raw: string, locale: string): string
    {
        return this.#<private>(raw, locale);
    }

    #<private>(raw: string, locale: string): string
    {
        return raw;
    }
}

export const <Name> = new <Name>Utils();
```

A plugin's own `utils/` holds `<Name>Keys` the same way, as one object every
cache key comes from:

```ts
export const <Name>Keys = {
    all: (): readonly unknown[] => ["<name>"],
    list: (query: <Name>Query): readonly unknown[] => ["<name>", "list", query.<field> ?? "any"],
    one: (id: string): readonly unknown[] => ["<name>", "one", id],
};
```

Reached as `@utils/<Name>`. A formatter takes the locale rather than reading
one, so the same value renders the same way in a test.

==> #docs/stack.md

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

## Kernel fault codes, by when they fire

A `KernelFault` carries a `code`. Branch on that, never on the message. Every
message names the plugin, the thing and the fix, so this maps when to expect
which rather than replacing the sentence you will read.

**At boot, from a contract that does not hold.** `DUPLICATE_PLUGIN`,
`UNKNOWN_DEPENDENCY`, `DEPENDENCY_CYCLE`, `INVALID_NAME`, `INVALID_CONFIG`,
`INVALID_ROUTE`. And one duplicate per kind, each meaning two plugins claim one
name so which answers would depend on boot order: `DUPLICATE_ROUTE`,
`DUPLICATE_SLOT`, `DUPLICATE_EVENT`, `DUPLICATE_HOOK`, `DUPLICATE_COMMAND`,
`DUPLICATE_PERMISSION`, `DUPLICATE_FRAME`, `DUPLICATE_PAGE`.

**At boot, about who may decide what a viewer holds.** `DUPLICATE_GRANTS` is
two plugins declaring `grants`. `UNNOMINATED_GRANTS` is one declaring it that
the application did not name in `grantedBy`. `UNGRANTABLE_PERMISSION` is a
route asking for something nothing grants, so nobody could ever reach it.

**At boot, from one plugin naming another's.** `UNDECLARED_EVENT`,
`UNDECLARED_HOOK`, `UNDECLARED_SLOT`, `UNDECLARED_COMMAND`,
`UNDECLARED_PERMISSION`, `UNDECLARED_DEPENDENCY`. Each says which plugin owns
what you reached for, and that `dependsOn` is where you say so.

**At the first outbound request.** `DUPLICATE_HEADER` is two plugins whose
`sends` both set one header.

**While running.** `PERMISSION_DENIED` is a command whose `requires` the viewer
does not hold — a UI guard, so the server must refuse it too. `INVALID_PAYLOAD`
is an event or command input failing its schema. `NOT_STARTED` is reaching the
kernel before `start()` finished or after `stop()`.

`OFF_BASE` is a `TransportFault`, not a kernel one: a path that would carry
this app's headers off its own origin.
