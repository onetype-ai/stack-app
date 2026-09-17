# utils/

A class of methods any plugin may reach: `plugin.ts`, `index.ts`, a service, a
section, a component. Exported as a singleton, so a caller never constructs
one.

It takes values and returns values. Reaching a plugin, the kit or `@ui` is a
lint error: needing `ctx` means it is a service.

```ts
class <Name>Utils
{
    <method>(raw: string, locale: string): string
    {
        return this.#<private>(raw, locale);
    }

    #<private>(raw: string, locale: string): string
    {
        return raw;
    }
}

export const <Name> = new <Name>Utils();
```

A plugin's own `utils/` holds `<Name>Keys` the same way, as one object every
cache key comes from:

```ts
export const <Name>Keys = {
    all: (): readonly unknown[] => ["<name>"],
    list: (query: <Name>Query): readonly unknown[] => ["<name>", "list", query.<field> ?? "any"],
    one: (id: string): readonly unknown[] => ["<name>", "one", id],
};
```

Reached as `@utils/<Name>`. A formatter takes the locale rather than reading
one, so the same value renders the same way in a test.
