import { Link } from "@tanstack/react-router";

import styles from "./Missing.module.css";

export const Missing = () =>
{
    return (
        <section className={styles.root} role="alert">
            <h1 className={styles.title}>This page does not exist</h1>
            <p className={styles.body}>The address you followed does not match anything this application serves.</p>
            <Link to="/demo" className={styles.back}>Go to the start</Link>
        </section>
    );
};
