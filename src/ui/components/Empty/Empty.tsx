import styles from "./Empty.module.css";

import type { ReactNode } from "react";

export type EmptyProps = {
    /** What is not here. A heading, not a sentence. */
    title: string;

    /** Why, or what to do about it. */
    hint?: string;
    action?: ReactNode;
};

export const Empty = ({ title, hint, action }: EmptyProps) =>
{
    return (
        <div className={styles.root}>
            <p className={styles.title}>{title}</p>
            {hint !== undefined && <p className={styles.hint}>{hint}</p>}
            {action}
        </div>
    );
};
