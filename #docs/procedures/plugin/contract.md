# Procedure: plugin contract

`plugin.ts` is the whole boundary: undeclared means it does not exist, and the
kernel refuses to start. The name is passed separately, so an error always
names the plugin.

```ts
export default definePlugin("demo", { ... });
```

## Keys

- `version` raised by a breaking change to a name or payload, `describe` one
  line naming what this owns, `dependsOn` the plugins whose API or permissions
  it uses.
- `config`: a schema, validated at startup. Never a secret.
- `permissions`: those it defines, described. Others use them by key.
- `services`: a factory returning what this plugin runs on.
- `fallback`: rendered when it throws; else the kernel's own.
- `grants`, `frame`, `pages`: what the viewer may do, the shell, and the 403
  and 404. One plugin owns each.
- `routes`: `path`, `title`, `component`, `requires`. Segments use `$param`.
- `slots`: those it opens, with the payload schema contributions get.
- `contributes`: slots in others it fills, with `order` and `requires`.
- `emits`, `listens`: announced and heard, each with a schema. Undeclared
  fails; a listener that throws stays contained.
- `hooks`, `participates`: points this plugin owns and runs, and others' it
  joins. A returned string rejects.
- `commands`: imperative entry points, with a schema and `requires`.
- `setup` / `teardown`: run at start and stop.

## Rules

`services` comes before anything reading `ctx.services`: inference runs left to
right. What `ctx` carries is in the kit's `reference.md`.

Every crossing carries a description and a schema, and a payload failing it is
rejected at the boundary. Referencing another plugin's permission makes it a
dependency. Schemas grow only through optional fields; removing one raises
`version`.
