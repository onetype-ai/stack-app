# Names in the examples

Every example is one plugin, `items`, holding `Item`s that each have a
`title`, plus `layout`, which frames every page. They were compiled, linted
and tested as written, then removed from `src/`.

Substitute your own names; none is a name to keep.

| | |
|---|---|
| `items`, `Items` | the plugin folder, and what it exports |
| `Item`, `title` | a type it owns, and one of its fields |
| `ItemStore` | its service, on `ctx.services.items` |
| `layout`, `layout.menu` | another plugin, and a slot it opens |
| `items.created` | an event: something that happened, a noun |

Methods are verbs in the imperative: `get`, `list`, `create`, `update`,
`remove`, `find`, `send`, `handle`.
