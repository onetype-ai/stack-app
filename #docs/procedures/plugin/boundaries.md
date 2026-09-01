# Procedure: plugin boundaries

Four ways to cross, and one rule on who may. Pick by what you need back.

## Public API

You need a result now, from a plugin in `dependsOn`.

```ts
import { Demo } from "@plugins/demo";

await Demo.create(ctx, "A new item");
```

Methods are the capability, named for what a caller wants done. They take `ctx`
and reach the plugin's services through it, so they work anywhere a context
exists: `setup`, a listener, a command. `use()` is the exception, for
components.

An `index.ts` holding only types and a hook exposes nothing: another plugin can
render beside it but never ask it for anything. It is a plugin's only importable
file; a deeper path is a defect.

## Events

You announce that something happened, want nothing back, and never wait. Emit
only after the state it describes is written: a write and its event must never
disagree.

A listener that throws reaches neither the emitter nor the others. It is caught,
logged and recorded.

Never request and respond over events: that is a public API with worse types.

## Slots

You extend another plugin without importing it. It opens a named slot, you
contribute to it. Nav items, toolbar buttons and settings panels are
contributions, never imports.

The opener defines the payload schema; one failing it is rejected at startup.

## Hooks

The owner runs a lifecycle point and lets others intercept. A participant
rejects by returning a reason, which the owner surfaces.

## Permissions

A plugin defines its permissions; anything guarded references them by key. The
UI reflects what the API enforces, never decides.

## Rules

Everything crossing is declared in `plugin.ts`. Undeclared does not exist.

What one plugin uses stays inside it, moving to a shared layer only when a
second needs it.
