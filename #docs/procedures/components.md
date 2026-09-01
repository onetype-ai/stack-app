# Procedure: components, sections, pages

Three levels of one thing. Each composes the one below; none reaches down.

- **component** — smallest unit. Knows no domain.
- **section** — composes components into a self-contained block. Knows no page.
- **page** — composes sections, and is the only level that loads data.

## State

One rule for all three: state lives where it cannot escape.

- **component** — state nothing outside can name: hover, open, cursor.
- **section** — state the section shares: which item is expanded, which tab is
  active. Effects leaving it exit through a callback prop.
- **page** — state from outside: server, URL, plugin, config.

A level receiving a value as a prop never also stores it — two sources of truth is a
bug waiting to happen.

## Files

One folder per unit, named for it, holding `Name.tsx` and `Name.module.css`. The
layer's root `index.ts` is its only entry; nothing imports a path inside it.

## Markup and styles

The stylesheet roots at `.root`; children are reached through it, never as bare
class names. Variants are classes, state is a `data-` attribute. Names say what an
element is, not how it looks.

## Rules

Props in, markup out. No fetching, no global reads, no knowledge of what is above.
A unit that behaves differently by where it sits is not composable.

Every control is keyboard-operable, visibly focused, and named. Every unit handles
its empty, loading and error case, or renders nothing on purpose. Anything a caller
passes is typed; optional props are genuinely optional.

## Proving it

- Test through the public surface, by what a user can see and do.
- Break the behaviour; the test must fail. Staying green proves nothing.
- Render with the smallest legal props, then with everything supplied.
- Operate it by keyboard alone.
