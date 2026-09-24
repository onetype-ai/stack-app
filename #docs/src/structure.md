# src structure

```
src/
├── main.tsx        composition root
├── kernel/         mount, tree, locale, log
├── plugins/        one folder a capability
├── ui/             presentational, no domain
│   ├── components/ Name/Name.tsx
│   └── sections/   Name/Name.tsx
└── utils/          pure, no domain
```

Nothing central lists the plugins: adding one touches no file above.

## Inside a plugin

`*` the kernel requires.

```
plugins/items/
├── plugin.ts *     one default export
├── usage.md *      under 1800 characters
├── index.ts        the public API, the one importable file
├── types/          PascalCase.ts, one a file
├── api/            camelCase.ts, one server surface a file
├── services/       camelCase.ts, one class a file
├── pages/          Name/Name.tsx, one route a folder
├── sections/       Name/Name.tsx, composed
├── components/     Name/Name.tsx, presentational only
├── hooks/          useName.ts, one a file
├── utils/          PascalCase.ts, one class a file
└── tests/          camelCase.test.ts, flat
```

The folders above are the common ones, not a closed list. When code doesn't
fit any of them, create a new folder named for its role instead of forcing it
into an existing one. `utils/` holds only small, domain-free helpers.

A `.tsx` folder holds its own `.module.css`.

Every key `plugin.ts` accepts: `version`, `describe`, `dependsOn`, `config`,
`permissions`, `services`, `grants`, `grantsSupported`, `routes`, `pages`,
`frame`, `slots`, `contributes`, `emits`, `listens`, `hooks`, `participates`,
`commands`, `sends`, `messages`, `fallback`, `setup`, `teardown`. Only the
first two are required.
