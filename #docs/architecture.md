# Architecture

## One capability, one plugin

A plugin is a capability that could be swapped for another implementation without
the rest noticing. New technology means a new plugin, not a branch inside one.

A capability that knows nothing about what we build is a package — solved once,
reusable. Plugins know the domain; packages do not.

The boundary lets an agent work on one plugin knowing only its contract — not
context economy, but a guarantee it cannot break what it cannot see.

## Declared or absent

`plugin.ts` is the whole boundary: routes, slots, events, hooks, permissions,
commands, config and dependencies, each described and schema-checked.

Undeclared means absent, and the kernel refuses to start rather than warn — a
boundary crossable by accident is none.

## Four ways to cross

A public API for a result you need now; events to announce what happened; slots to
extend another plugin without importing it; hooks to let a participant reject.
Request-and-response over the bus is forbidden — see `plugin/boundaries.md`.

## Failure is local

Every plugin renders behind an error boundary, so a failure degrades its region,
not the application. A throwing listener never reaches the emitter or the others;
it is caught, logged and recorded.

## The UI reflects, never decides

Permissions are declared by their owner and checked against whatever source is
registered — today a session, later an account. A route without permission renders
403, not 404: hiding it protects nothing.

## Code is the authority

Plugins are discovered from the folder, not a list. A cross-plugin import is checked
against `dependsOn`, so an undeclared one fails.

A check that has never failed proves nothing: every guarantee here was broken on
purpose and watched to fail.
