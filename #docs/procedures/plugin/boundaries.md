# Procedure: plugin boundaries

Four ways to cross, and one rule on who may. Pick by what you need back.

## Public API

You need a result now, from a plugin in `dependsOn`.

```ts
import { Demo } from "@plugins/demo";

await Demo.create(ctx, "A new item");
```

Methods are the capability, named for what a caller wants done. They take `ctx`
and reach the plugin's services through it, so they run in `setup`, a listener
or a command. `use()` is the exception, for components.

A component crosses the same way: `Demo.ItemRow`. A slot lets the opener place
what it never imported; an exported component lets the caller place what it
chose.

It is a plugin's only importable file, and a deeper path is a defect. One
holding nothing but types and a hook exposes nothing at all.

## Events

You announce that something happened, want nothing back, and never wait. Emit
only after the state is written: a write and its event must never disagree.

A listener that throws reaches neither the emitter nor the others; it is caught
and recorded.

Never request and respond over events: that is a public API with worse types.

## Slots

You extend another plugin without importing it. Nav items, toolbar buttons and
settings panels are contributions, never imports.

The opener defines the payload schema; one failing it is rejected at startup.

## Hooks

The owner runs a lifecycle point and lets others intercept. A participant
rejects by returning a reason.

## Permissions

A plugin defines its permissions; anything guarded references them by key. The
UI reflects what the API enforces, never decides.

## Rules

Everything crossing is declared in `plugin.ts`. Undeclared does not exist. What
one plugin uses stays inside it, moving to a shared layer only when a second
needs it.
