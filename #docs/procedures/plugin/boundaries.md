# Procedure: plugin boundaries

Four ways to cross. Pick by what you need back.

## Public API

A result now, from a plugin in `dependsOn`.

```ts
import { Demo } from "@plugins/demo";

await Demo.create(ctx, "A new item");
```

Methods are named for what a caller wants done. They take `ctx` and reach the
plugin's services through it, so they run anywhere. `use()` is the exception,
for components.

A component crosses the same way: `Demo.ItemRow`. A slot lets the opener place
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

## Hooks

The owner runs a lifecycle point and lets others intercept. A participant
rejects by returning a reason.

## Permissions

A plugin defines its permissions; anything guarded references them by key.

## Rules

Everything crossing is declared in `plugin.ts`. What one plugin uses stays
inside it until a second needs it.
