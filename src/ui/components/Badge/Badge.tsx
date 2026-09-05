import styles from "./Badge.module.css";

import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "accent" | "success" | "caution" | "danger";

export type BadgeProps = {
    tone?: BadgeTone;
    children: ReactNode;
};

export const Badge = ({ tone = "neutral", children }: BadgeProps) =>
{
    return <span className={styles.root} data-tone={tone}>{children}</span>;
};
