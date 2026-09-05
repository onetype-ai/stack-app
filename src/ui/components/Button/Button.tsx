import { Spinner } from "../Spinner/Spinner";
import styles from "./Button.module.css";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonTone = "accent" | "quiet" | "plain" | "danger";

export type ButtonSize = "small" | "medium";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    tone?: ButtonTone;
    size?: ButtonSize;

    /** Waiting on something. Disables, and says so to a screen reader. */
    busy?: boolean;
    stretch?: boolean;
    before?: ReactNode;
    children: ReactNode;
};

export const Button = ({
    tone = "quiet",
    size = "medium",
    busy = false,
    stretch = false,
    before,
    children,
    disabled,
    type = "button",
    ...rest
}: ButtonProps) =>
{
    return (
        <button
            {...rest}
            type={type}
            className={styles.root}
            data-tone={tone}
            data-size={size}
            data-stretch={stretch || undefined}
            disabled={disabled === true || busy}
            aria-busy={busy || undefined}
        >
            {busy ? <Spinner /> : before}
            {children}
        </button>
    );
};
