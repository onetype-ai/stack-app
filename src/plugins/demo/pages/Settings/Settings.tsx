import { Demo } from "../../index";

import styles from "./Settings.module.css";

export const Settings = () =>
{
    const { config } = Demo.use();

    return (
        <div className={styles.root}>
            <header className={styles.head}>
                <p className={styles.eyebrow}>Demo</p>
                <h1 className={styles.title}>Settings</h1>
                <p className={styles.body}>Configuration this plugin resolved at startup.</p>
            </header>

            <dl className={styles.body}>
                <dt className={styles.term}>Page size</dt>
                <dd className={styles.value}>{config.pageSize}</dd>

                <dt className={styles.term}>Feature flag</dt>
                <dd className={styles.value}>{config.featureFlag ? "on" : "off"}</dd>
            </dl>
        </div>
    );
};
