# Procedure: ui/styles

Global, unscoped styles. What one component uses is a CSS Module beside it.

## Layers

Order is fixed by `index.css`; a layer may only depend on ones above it.

- `reset.css`: neutralises browser defaults. Removes only, declares nothing.
- `tokens.css`: every design value, as custom properties on `:root`. No selectors.
- `base.css`: bare element appearance. Element selectors only.
- `utilities.css`: reusable global classes.
- `index.css`: imports only, never a rule.

The app imports `index.css` once, at the entry. Nothing imports a layer directly.

## Where a style belongs

Stop at the first yes:

1. A raw value used by more than one rule → `tokens.css`
2. Every instance of the element should look so without a class → `base.css`
3. One repeated behaviour across unrelated components → `utilities.css`
4. Otherwise → a CSS Module beside the component

Re-declaring what `base.css` already gives you is a bug.

## Rules

Every value a component sees is a token. A literal colour, length, duration or
easing curve outside `tokens.css` is a defect, and no lint catches it yet.
Names describe role, not appearance.

A utility is one behaviour, prefixed `ui-` so a global class is never mistaken
for a module one. Prove it needed in two unrelated places first; one used in a
single place is a misfiled module rule.

Fonts load in `index.html`, never through CSS; the family name is a token.
Preload what first paint needs, and declare a fallback stack.

## Proving it

- Break a rule; the page must change. Nothing moving means it never applied.
- Change a token; every consumer must move. One that did not is hardcoded.
- Check smallest and largest viewport, and keyboard focus on every control.
