# brief

## What this is

A Stack front-end with no capabilities in it. Every capability is a plugin,
and this carries none: it starts, renders nothing, and waits for the first
plugin somebody writes.

Its boundary is composition. Which plugins this application ships, which
server `/api` reaches, which port Vite listens on. Everything a plugin can do,
and everything checked before one starts, belongs to `@onetype/stack-app-kit`
and is documented there.

## Where we are

`src/kernel/` is four files, `mount.tsx` is 31 lines, and `main.tsx` renders
what `start` answered. Eight tests.

It was 33 tests across eight files. What left did not disappear: the route
tree, the root redirect, the port and proxy rules and the document checks all
moved into the kit, where every application gets them instead of writing them
again. The tests moved with them.

## Vision

Somebody clones this, writes one plugin with a page in it, and sees it at a
URL. Nothing in the scaffold should be read before that.

## Next

A first real plugin, which is the only thing that will say whether the
scaffold is actually empty enough.
