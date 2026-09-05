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
