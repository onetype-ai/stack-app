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
