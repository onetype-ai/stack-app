# src structure

```
src/
├── main.tsx        composition root
├── kernel/         settings, mount, query client
├── plugins/        one folder a capability
├── ui/             presentational, no domain
└── utils/          pure, no domain
```

Nothing central lists the plugins: adding one touches no file above it.

## Inside a plugin

`*` is required by the kernel.

```
plugins/<plugin>/
├── plugin.ts *     one default export
├── usage.md *      under 1800 characters
├── index.ts        the public API, the only importable file
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

Every `.tsx` folder holds its own `.module.css`.

Every key `plugin.ts` accepts: `version`, `describe`, `dependsOn`, `config`,
`permissions`, `services`, `grants`, `grantsSupported`, `routes`, `pages`,
`frame`, `slots`, `contributes`, `emits`, `listens`, `hooks`, `participates`,
`commands`, `sends`, `fallback`, `setup`, `teardown`. Only the first two are
required.

Placeholders every example uses: `placeholders.md`.
