# Procedure: plugin structure

One plugin is one capability: swap its implementation and nothing notices.

The `demo` plugin is the worked example: read it once, then delete it. Its styles
are deliberately plain — take the mechanics, never the look.

## Folders

```
plugins/<name>/
├── plugin.ts       the contract: all that crosses the boundary
├── index.ts        the public API: all another plugin may import
├── types/          one type per file, schema and type together
├── utils/          pure functions, no domain
├── api/            calls the backend, validates responses
├── services/       the logic, over api and hooks
├── components/     private
├── sections/       blocks of components
├── pages/          screens
└── tests/
```

No `index.ts` inside a folder: a plugin is private throughout, so a barrel
guards nothing.

## Where code belongs

Stop at the first yes:

1. Describes a value's shape → `types/`, with its schema
2. Knows a backend route → `api/`
3. Knows the domain, not the backend → `services/`
4. Pure and domain-free → `utils/`
5. Renders → `components/`, `sections/` or `pages/`

Validation lives beside the type it validates.

## Style

Everything is an object with methods; no loose top-level `const`.

Allman braces for functions and blocks, arrows included: a named function's body
is a block with a `return`, never one expression. An inline callback to `map`,
`filter` or a library stays as it is.

An object's brace stays on the key line, as does an array's. No comments.

## Adding a plugin

1. Create the folder and a `plugin.ts` declaring only what it needs.
2. Write `index.ts` last — the smallest surface consumers need.
3. Prove it starts, and that a wrong contract is rejected.
4. Test through the public API, break it, watch it fail.
