import { Empty } from "@ui";

import styles from "./NoEntry.module.css";

export type NoEntryProps = {
    permission?: string | undefined;
};

export const NoEntry = ({ permission }: NoEntryProps) =>
{
    return (
        <section className={styles.root} role="alert">
            <Empty
                title="This page is not yours to open"
                hint={permission === undefined
                    ? "The desk you are signed in at does not carry what this page asks for."
                    : `The desk you are signed in at does not carry "${permission}".`}
            />
        </section>
    );
};
