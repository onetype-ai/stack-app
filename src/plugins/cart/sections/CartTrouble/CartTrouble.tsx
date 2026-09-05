import { Button } from "@ui";

import styles from "./CartTrouble.module.css";

export type CartTroubleProps = {
    error: unknown;
    plugin: string;
    reset: () => void;
};

export const CartTrouble = ({ error, plugin, reset }: CartTroubleProps) =>
{
    return (
        <section className={styles.root} role="alert">
            <p className={styles.title}>{`The ${plugin} pick list stopped working here.`}</p>
            <p className={styles.body}>{error instanceof Error ? error.message : String(error)}</p>

            <Button tone="quiet" size="small" onClick={reset}>Try again</Button>
        </section>
    );
};
