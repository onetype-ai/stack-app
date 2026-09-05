# Procedure: components, sections, pages

Three levels. Each composes the one below; none reaches down.

- **component**: smallest unit. Knows no domain.
- **section**: composes components into a self-contained block. Knows no page.
- **page**: composes sections, and is the only level that loads data.

A **hook** is none of them, but behaviour a unit borrows. It lives in `hooks/`,
one per file, named `use…`, returns what the caller renders with, and renders
nothing itself.

## State

A component keeps what nothing outside can name, a section what it shares, a
page what comes from outside. An effect leaving a section exits through a
callback prop.

A level receiving a value as a prop never also stores it.

## Files

One folder per unit, named for it, holding `Name.tsx` and `Name.module.css`. A
hook is one file, no folder. The layer's root `index.ts` is its only entry.

## Markup and styles

The stylesheet roots at `.root`; children are reached through it, never as bare
class names. Variants are classes, state is a `data-` attribute. Names say what
an element is, not how it looks.

## Rules

Props in, markup out. No fetching, no global reads, no knowledge of what is
above.

Every control is keyboard-operable, visibly focused, and named. Every unit
handles its empty, loading and error case, or renders nothing on purpose.

## Proving it

Render with the smallest legal props, then with everything supplied. Operate it
by keyboard alone.
