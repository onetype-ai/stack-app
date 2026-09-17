# A component

One folder a unit: `<Name>/<Name>.tsx` and `<Name>.module.css` beside it. The
same shape whether it lives in `src/ui` or in a plugin's `components/`.

Props in, markup out. No service, no plugin, no hook that reads the address,
and `fetch` is a lint error. Everything shown arrives as a prop, so the same
unit serves a page, a section and a test.

```tsx
import { useId, useRef } from "react";

import { useFocusTrap } from "@onetype/stack-app-kit/react";

import styles from "./<Name>.module.css";

import type { ReactNode } from "react";

export type <Name>Tone = "plain" | "accent" | "alarm";

export type <Name>Props = {
    title: string;
    tone?: <Name>Tone;
    busy?: boolean;
    onDismiss?: () => void;
    children?: ReactNode;
    trailing?: ReactNode;
};

export const <Name> = ({ title, tone = "plain", busy = false, children, trailing }: <Name>Props) =>
{
    const id = useId();

    return (
        <section
            className={styles.root}
            data-tone={tone}
            data-busy={busy || undefined}
            aria-labelledby={id}
            aria-busy={busy || undefined}
        >
            <h2 id={id} className={styles.title}>{title}</h2>
            {children}
            {trailing}
        </section>
    );
};
```

`data-tone` and `data-busy` carry state, so the stylesheet reads an attribute
rather than a second class. `aria-labelledby` and `aria-busy` say the same
thing to a screen reader, and a test asserts on the role.

`trailing` and `children` are how a caller adds to a unit without it knowing
what: the unit places, the caller decides.
