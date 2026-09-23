# The application around the plugins

`src/kernel/` and two entries hold everything that is not a plugin. A project
changes them rarely.

- `main.tsx` negotiates the viewer's locale, starts the kernel and renders
  `Tree`. A page `pnpm build` prerendered is hydrated in the locale it was
  written in, then switched to the viewer's.
- `kernel/tree.tsx` is the one tree the browser and the prerender both render,
  so they cannot drift. `AppBoundary` shows a page with a retry, not a blank
  screen, and logs what it caught.
- `kernel/locales.ts` lists the locales. A language is added there and in each
  plugin's `messages`.
- `src/prerender.tsx` is the build's entry for `render: "prerender"` routes.
- `kernel/log.ts` logs at `VITE_LOG_LEVEL`, and what nothing caught.

## Settings

`VITE_<PLUGIN>__<FIELD>` reaches that plugin's `config`, checked at start.
Every `VITE_` value ships in the bundle, so a secret-looking name refuses the
build.

## End to end

`@onetype/stack-app-kit/e2e` starts the api and this app on strict ports and
opens a watched browser that records console errors, throws and 5xx answers:

```ts
const stack = await Stack.start({ services: { app: { folder: ".",
    command: ["pnpm", "vite", "--strictPort"], port: 7591 } } });
const browser = await Browsers.launch();
const { page, problems } = await browser.open();
```

Its `usage.md` in `node_modules` has the rest.
