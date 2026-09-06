import { useId } from "react";

import styles from "./Field.module.css";

import type { InputHTMLAttributes, ReactNode } from "react";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id"> & {
    label: string;

    /** What to do, when the value will not do. Read aloud when it appears. */
    problem?: string;

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
export const Field = ({ label, problem, hint, ...rest }: FieldProps) =>
{
    const id = useId();
    const describedBy = [hint !== undefined ? `${id}-hint` : "", problem !== undefined ? `${id}-problem` : ""]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={styles.root}>
            <label className={styles.label} htmlFor={id}>{label}</label>

            <input
                {...rest}
                id={id}
                className={styles.input}
                aria-invalid={problem !== undefined || undefined}
                aria-describedby={describedBy === "" ? undefined : describedBy}
            />

            {hint !== undefined && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}

            {problem !== undefined && (
                <p id={`${id}-problem`} className={styles.problem} role="alert">{problem}</p>
            )}
        </div>
    );
};
