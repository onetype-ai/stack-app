# Procedure: plugin tests

A plugin tests itself in its own `tests/`, without the application or a server.

## What to test

Test the contract through the public surface, never the implementation.

- **Services** — what a caller gets back and what reached the transport. Give it a
  fake context; assert on the request made and the value returned.
- **Components and sections** — what a user can see and do, never internal state.
- **Pages** — that loading, empty, error and loaded each render their own state.
- **The contract** — that the kernel accepts `plugin.ts`, and rejects it when a
  declaration is wrong.

Do not test a schema by feeding it valid input; test the input it must reject.

## Fakes

The context is a fake, not a mock framework. Write one per plugin, giving it only
what the cases need:

- `http` returns canned responses and records every request.
- `events.emit` records instead of dispatching, so a test asserts what was
  announced.
- `hooks.run` returns a rejection reason or `undefined`.
- `permissions.has` answers from a list the test controls.

Never reach the network — a test that needs a server is proving the server.

A fake that accepts what a real one rejects is where bugs hide.

## Shape

Arrange, act, assert, with a blank line between them. No shared setup hiding a
dependency, and no helper wrapping the assertion — a reader must see what is
claimed without opening another file. Each test is order-independent.

## Proving a test

A test that has never failed proves nothing.

Break the behaviour on purpose — remove the guard, invert the condition, delete
the emit — and watch it fail naming the real cause. Then put it back. If it stayed
green, it tested nothing.

The same for a bug: reproduce it, watch the test fail, then fix it.
