import styles from "./Forbidden.module.css";

export type ForbiddenProps = {
    permission?: string | undefined;
};

export const Forbidden = ({ permission }: ForbiddenProps) =>
{
    return (
        <section className={styles.root} role="alert">
            <h1 className={styles.title}>You cannot see this page</h1>
            <p className={styles.body}>
                {permission === undefined
                    ? "Your account does not carry the permission this page needs."
                    : `Your account does not carry "${permission}".`}
            </p>
        </section>
    );
};
