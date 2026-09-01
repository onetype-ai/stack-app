import { Outlet } from "@tanstack/react-router";

import { Slot } from "@onetype/stack-app-kit/react";

import styles from "./AppFrame.module.css";

export const AppFrame = () =>
{
    return (
        <div className={styles.root}>
            <aside className={styles.sidebar}>
                <nav className={styles.nav}>
                    <Slot name="demo.nav" />
                </nav>

                <Slot name="demo.sidebar" />
            </aside>

            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
};
