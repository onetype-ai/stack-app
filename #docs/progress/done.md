# done

- Composition only: `mount.tsx` discovers plugins, names the router library
  and what wraps a page, and `start` answers a kernel and a built router.
  31 lines.
- `vite.config.ts` names this project's aliases and CSS convention; the port
  and proxy rules come from the kit's `serving`.
- Eight tests, each of which can fail: it starts and carries a router, a
  second start is a fresh one, the query client retries nothing, and
  `Project.findAll` finds nothing.
- Proved in a real browser, not only in a test runner: with one throwaway
  plugin, `/` redirected to its page, the page rendered inside the declared
  frame, an unknown path answered the 404 page, and the console stayed clean.

## Moved into the kit

- `Routes.build` and its tests. The kit's router plugin already held most of
  it; what it lacked was the redirect for a root no plugin declares.
- The port and proxy rules out of `vite.config.ts` (8 tests), and `Env` down
  to two lines over the kit's rules.
- `docs.test.ts` and `shipping.test.ts` (9 tests) became two checks inside
  `Project`, so every application gets them.

## The browser runs itself again

`pnpm test:browser` starts Vite if nothing is listening, opens the page in
Chromium, and fails on a console error or anything thrown. `verify` runs it.
Proved by pointing the mount at an element that does not exist: it reported
the throw and exited non-zero.

## Documents

`#docs/kit/2a.composition.md` was 10,232 characters, past any reading. It is
nine documents now, none over 1,800 but one worked example, which is held to
3,000 by a check of its own.
