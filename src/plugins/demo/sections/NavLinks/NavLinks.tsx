import { Link } from "@tanstack/react-router";

import styles from "./NavLinks.module.css";

export const NavLinks = () =>
{
    return (
        <div className={styles.root}>
            <Link to="/demo" className={styles.link} activeProps={{ className: styles.active }}>
                Items
            </Link>

            <Link to="/demo/settings" className={styles.link} activeProps={{ className: styles.active }}>
                Settings
            </Link>
        </div>
    );
};
