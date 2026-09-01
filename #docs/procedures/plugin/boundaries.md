# Procedure: plugin boundaries

Four ways to cross, and one rule about who may. Pick by what you need back.

## Public API

You need a result now, from a plugin in `dependsOn`. Synchronous, typed, direct.

```ts
import { Demo } from "@plugins/demo";
```

A plugin exposes an object whose methods call its own internals, never a
re-export standing in the middle. React access stays a hook: `Demo.use()` cannot
become a plain method, because a hook outside a render is a crash.

`index.ts` is a plugin's only importable file. A deeper path is a defect, whether
or not it compiles.

## Events

You announce that something happened. You do not know who listens, want nothing
back, and never wait. Emit only after the state it describes is written: a write
and its event must never disagree.

A listener that throws reaches neither the emitter nor the others. It is caught,
logged and recorded where it can be reviewed.

Never request and respond over events — that is a public API with worse types and
a hidden dependency.

## Slots

You extend another plugin without importing it. It opens a named slot, you
contribute to it. Nav items, toolbar buttons and settings panels are
contributions, never imports.

The opener defines the payload schema, and a contribution failing it is rejected
at startup.

## Hooks

The owner runs a lifecycle point and lets others intercept. A participant rejects
by returning a reason, which the owner surfaces to the caller.

## Permissions

A plugin defines its permissions; anything guarded references them by key. The UI
reflects what the API enforces — it never decides.

## Rules

Everything crossing is declared in `plugin.ts`. Undeclared does not exist.

What one plugin uses stays inside it, moving to a shared layer only when a second
genuinely needs it.
