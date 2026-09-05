import { useId } from "react";

import styles from "./Field.module.css";

import type { InputHTMLAttributes, ReactNode } from "react";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id"> & {
    label: string;

    /** What to do, when the value will not do. Read aloud when it appears. */
    wrong?: string;

    /** What the field wants, before anything is wrong. */
    hint?: string;
    children?: ReactNode;
};

/**
 * A labelled input, and what is wrong with it.
 *
 * The label is tied by id rather than by wrapping, so a screen reader reads
 * it for a field it does not enclose. `aria-describedby` carries the hint and
 * the error together: a reader hears both, in that order.
 */
export const Field = ({ label, wrong, hint, ...rest }: FieldProps) =>
{
    const id = useId();
    const says = [hint !== undefined ? `${id}-hint` : "", wrong !== undefined ? `${id}-wrong` : ""]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={styles.root}>
            <label className={styles.label} htmlFor={id}>{label}</label>

            <input
                {...rest}
                id={id}
                className={styles.input}
                aria-invalid={wrong !== undefined || undefined}
                aria-describedby={says === "" ? undefined : says}
            />

            {hint !== undefined && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}

            {wrong !== undefined && (
                <p id={`${id}-wrong`} className={styles.wrong} role="alert">{wrong}</p>
            )}
        </div>
    );
};
