# todo

Ordered by what blocks the most.

## A first plugin

Nothing here has been used. A scaffold that has never carried a capability is
a guess about what carrying one needs.

## Known, and deliberate

- **`src/plugins/` and `src/utils/` are empty**, and `src/ui/index.ts` exports
  nothing. What a plugin looks like is in `#docs/src/plugin/`.
- **The router library is named in `mount.tsx`**, not in the kit. The kit
  builds the tree and takes the library as a parameter, so swapping routers
  changes these four lines and nothing a plugin wrote.
