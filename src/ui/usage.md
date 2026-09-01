# ui

Shared presentational layer. Knows no domain, imports no plugin.

Import units from the root; import styles once, at the app entry:

```ts
import { Button, Field } from "@ui";
import "@ui/styles/index.css";
```

## Layout

- `components/` — smallest units. Stateless, no domain knowledge.
- `sections/` — self-contained blocks composed of components. Hold their own UI
  state, never load data.
- `styles/` — global stylesheets: reset, tokens, base, utilities.
- `index.ts` — the only entry. A plugin imports `@ui`, never a path inside it.

## Finding what exists

`index.ts` names every unit and is verified against the folders on disk, so it is
never stale. Read it to see the full list.

For what a unit accepts, read its exported prop type — `ButtonProps`, `FieldProps`
and so on. The type is the contract; there is no second description to fall out of
date with it.

## Rules

Styling comes from tokens; a literal colour, length or duration in a module fails
the tests. Every unit is keyboard-operable, has a visible focus state, and handles
its empty case.

Props in, markup out. A unit never fetches, never reads global state, and never
knows what sits above it.

## Adding a unit

1. Create `Name/` holding `Name.tsx` and `Name.module.css`.
2. Export it from `index.ts`.
3. Test it through its public surface, then break the behaviour and watch the test
   fail. One that stays green proves nothing.

A unit missing from `index.ts`, or an entry with no folder, fails the tests.
