import styles from "./Spinner.module.css";

export type SpinnerProps = {
    /** What is being waited for. Read aloud, never shown. */
    label?: string;
};

export const Spinner = ({ label = "Loading" }: SpinnerProps) =>
{
    return <span className={styles.root} role="status" aria-label={label} />;
};
