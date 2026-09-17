# ui/

The presentational layer every plugin may reach: units, tokens and the reset.
It holds no domain and imports no plugin.

The scaffold ships `index.ts` and nothing else. The layout below is what to
build, in the order a first screen needs it.

```
ui/
├── index.ts                    what `@ui` exports
├── components/Name/Name.tsx    one unit a folder, with its own module.css
└── styles/                     the reset, the tokens, the base
```

Reached as `@ui` for a unit and `@ui/styles/...` for a stylesheet, both mapped
in `tsconfig.base.json` and `vite.config.ts`. A path that resolves to nothing
is reported by `Project.findAll()` before the first import of it.

`component.md` and `page.md` beside this file hold the shape each takes. A
plugin's `components/` and `pages/` follow them.

A token is named for its role, never its value, so a stylesheet reads and the
palette stays one file.

Every length, colour and duration in a plugin's stylesheet is a token. A
literal is a lint error: `Project.findAll()` names the file and the value.
