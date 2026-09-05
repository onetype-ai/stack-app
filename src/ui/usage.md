# ui

Shared presentational layer. Knows no domain, imports no plugin.

```ts
import { Button, Field } from "@ui";
import "@ui/styles/index.css";
```

## Layout

- `components/`: smallest units. Stateless, no domain knowledge.
- `sections/`: blocks composed of components. Hold their own UI state, never
  load data.
- `styles/`: `reset` clears, `tokens` declares, `base` and `utilities` apply.
  Imported once, in that order, through `styles/index.css`.
- `index.ts`: the only entry. A plugin imports `@ui`, never a path inside it.

## What exists

Tokens for colour, type, space, shape, depth and motion, and a `base` that
dresses bare elements in them. Dark and reduced motion answer the reader's own
setting.

Eight units: `Button`, `Field`, `Select`, `Badge`, `Empty`, `Skeleton`,
`Spinner`, `Modal`. Not chosen: five builds of five different applications
each reached for the same set, from an empty folder, without knowing about
each other.

## Rules

Styling comes from tokens: a literal colour, length or duration in a module is
a token that was not declared.

Props in, markup out. A unit never fetches, never reads global state, and never
knows what sits above it. Keyboard-operable, visible focus, an empty case.

## Adding a unit

1. Create `Name/` holding `Name.tsx` and `Name.module.css`.
2. Export it from `index.ts`.
3. Test it through its public surface, then break the behaviour and watch the
   test fail. One that stays green proves nothing.

For what a unit accepts, read its exported prop type. The type is the contract.
