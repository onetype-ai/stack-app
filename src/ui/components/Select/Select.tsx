import { useId } from "react";

import styles from "./Select.module.css";

import type { SelectHTMLAttributes } from "react";

export type Choice = {
    value: string;
    label: string;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "id" | "children"> & {
    label: string;
    choices: readonly Choice[];

    /** Shown first, selected by nobody: a placeholder that is not a value. */
    placeholder?: string;
};

export const Select = ({ label, choices, placeholder, ...rest }: SelectProps) =>
{
    const id = useId();

    return (
        <div className={styles.root}>
            <label className={styles.label} htmlFor={id}>{label}</label>

            <select {...rest} id={id} className={styles.select}>
                {placeholder !== undefined && <option value="">{placeholder}</option>}

                {choices.map((choice) => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                ))}
            </select>
        </div>
    );
};
