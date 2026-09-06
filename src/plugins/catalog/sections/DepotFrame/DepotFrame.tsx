import { Link, Outlet } from "@tanstack/react-router";

import styles from "./DepotFrame.module.css";

export const DepotFrame = () =>
{
    return (
        <div className={styles.root}>
            <a className="ui-visually-hidden" href="#work">Skip to the page</a>

            <header className={styles.bar}>
                <Link to="/catalog" className={styles.mark}>
                    <span className={styles.badge}>DP</span>
                    <span className={styles.wordmark}>Depot</span>
                </Link>

                <nav className={styles.nav} aria-label="Sections">
                    <Link to="/catalog" className={styles.link} activeProps={{ className: styles.here }}>
                        Stock
                    </Link>
                </nav>
            </header>

            <main id="work" className={styles.work}>
                <Outlet />
            </main>
        </div>
    );
};
