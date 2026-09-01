import styles from "./DemoError.module.css";

export type DemoErrorProps = {
    error: unknown;
    plugin: string;
    reset: () => void;
};

export const DemoError = ({ error, plugin, reset }: DemoErrorProps) =>
{
    return (
        <section className={styles.root} role="alert">
            <h2 className={styles.title}>{`The ${plugin} section stopped working`}</h2>
            <p className={styles.body}>{error instanceof Error ? error.message : String(error)}</p>

            <button type="button" className={styles.retry} onClick={reset}>Try again</button>
        </section>
    );
};
