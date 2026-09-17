# A page

One folder a route: `<Name>/<Name>.tsx` and `<Name>.module.css` beside it.
Only a plugin has them; `src/ui` holds none, because a page carries domain.

A page reads the address, calls a service through `useQuery`, and composes
sections. It holds no markup of its own beyond layout.

```tsx
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { <Name> as Plugin } from "../../index";
import { <Name>Table } from "../../sections/<Name>Table/<Name>Table";
import { <Name>Keys } from "../../utils/<Name>Keys";
import styles from "./<Name>s.module.css";

export const <Name>s = () =>
{
    const { services, config } = Plugin.use();
    const navigate = useNavigate();

    const page = useQuery({
        queryKey: <Name>Keys.list({}),
        queryFn: () => services.<subject>.list(),
    });

    return (
        <div className={styles.root}>
            {page.isError
                ? <p className={styles.wrong} role="alert">{page.error.message}</p>
                : (
                    <<Name>Table
                        <name>s={page.data?.<name>s ?? []}
                        loading={page.isPending}
                        onOpen={(id) => { void navigate({ to: "/<name>/$id", params: { id } }); }}
                    />
                )}
        </div>
    );
};
```

`queryKey` comes from `utils/<Name>Keys`, the same file a service invalidates
through, so a stale list cannot survive a write.

An error renders where the reader is, with `role="alert"`. A page that throws
instead reaches the plugin's `fallback`.
