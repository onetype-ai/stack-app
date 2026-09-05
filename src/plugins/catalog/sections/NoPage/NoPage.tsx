import { Link } from "@tanstack/react-router";

import { Empty } from "@ui";

import styles from "./NoPage.module.css";

export const NoPage = () =>
{
    return (
        <section className={styles.root} role="alert">
            <Empty
                title="No such page"
                hint="The address you followed matches nothing this depot serves."
                action={<Link to="/catalog" className={styles.back}>Back to stock</Link>}
            />
        </section>
    );
};
