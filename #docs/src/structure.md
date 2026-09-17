# Procedure: src structure

## The tree

```
src/
├── main.tsx        composition root
├── kernel/         env, mount, queries, routes
├── plugins/        one folder a capability
├── ui/             presentational, no domain
└── utils/          pure, no domain
```

Nothing central lists the plugins: adding one touches no file above it.

## Inside a plugin

`*` kernel requires it.

```
plugins/<name>/
├── plugin.ts *     one default export
├── usage.md *      under 1800 characters
├── index.ts        one exported object
├── types/          Name.ts, one type a file
├── api/            name.ts, one server surface a file
├── services/       name.ts, one class a file
├── pages/          Name/Name.tsx, one route a folder
├── sections/       Name/Name.tsx, composed, reaches services
├── components/     Name/Name.tsx, presentational only
├── hooks/          useName.ts, one hook a file
├── utils/          Name.ts, one class a file
└── tests/          name.test.ts, flat
```

Every `.tsx` folder holds its own `Name.module.css` beside it.
