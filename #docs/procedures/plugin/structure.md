# Procedure: plugin structure

One plugin is one capability: swap it and nothing notices.

## Folders

```
plugins/<name>/
├── plugin.ts       the contract: all that crosses the boundary
├── index.ts        the public API: methods, components, types
├── types/          one per file, schema and type together
├── utils/          pure functions, no domain
├── api/            the backend, validated
├── services/       the logic, over api and hooks
├── hooks/          one per file: state, effects, refs
├── components/     private
├── sections/       blocks of them
├── pages/          screens
└── tests/
```

No `index.ts` inside a folder: a plugin is private throughout.

## Where code belongs

Stop at the first yes:

1. Describes a value's shape → `types/`, with its schema
2. Knows a backend route → `api/`
3. Needs React state, an effect or a ref → `hooks/`
4. Knows the domain, not the backend → `services/`
5. Pure and domain-free → `utils/`
6. Renders → `components/`, `sections/`, `pages/`

Validation lives beside the type it validates. The schema stands outside the
object when a method returns that type: a `const` and a `type` of one name
cannot reference each other in a circle.

## Style

Everything is an object with methods; no loose top-level `const`. A hook is the
exception: React calls it, so it is a function `use…`, one per file.

Allman braces for functions and blocks, arrows included: a named function's body
is a block with a `return`, never one expression. An inline callback stays as
it is. An object's brace stays on the key line. No comments.

## Adding a plugin

`plugin.ts` first, declaring only what it needs; `index.ts` last, the smallest
surface a consumer needs. Prove it starts, that a wrong contract is rejected,
and that a test fails when behaviour breaks.
