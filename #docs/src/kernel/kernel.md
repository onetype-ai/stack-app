# kernel/

What this project decides about itself, before any plugin runs.

```
env.ts       what the environment carries, parsed once and refused early
mount.ts     discovery and start: the only caller of the kit's `start`
queries.ts   the query client every plugin's cache is built from
routes.tsx   the router, built from what the kernel registered
index.ts     what main.tsx reaches
```

`Mount.open(client)` passes `plugins`, `cache` and `transport`. A plugin
receives `ctx.config` keyed by its own name, and `ctx.http`; reaching past
them ties a capability to this one deployment.

Edited when the project changes shape: an environment variable, a base url,
somewhere else to find plugins. A capability is never added here — that is a
plugin, and adding one touches no file in this folder.
