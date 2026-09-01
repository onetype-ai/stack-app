import { Link } from "@tanstack/react-router";

import styles from "./QuickAction.module.css";

export const QuickAction = () =>
{
    return (
        <div className={styles.root}>
            <span className={styles.label}>Demo</span>
            <Link to="/demo" className={styles.open}>Open</Link>
        </div>
    );
};
