import { useNavigate } from "@tanstack/react-router";

import { useKept } from "@onetype/stack-app-kit/react";
import { Button } from "@ui";

import { Cart } from "../../index";
import { PickedLines } from "../../sections/PickedLines/PickedLines";
import styles from "./PickedList.module.css";

export const PickedList = () =>
{
    const { services, config } = Cart.use();
    const navigate = useNavigate();

    const list = useKept(services.picking.watch, services.picking.read);

    return (
        <div className={styles.root}>
            <header className={styles.head}>
                <p className={styles.eyebrow}>Cart</p>
                <h1 className={styles.title}>What is on the pick list</h1>
                <p className={styles.lead}>
                    Every part waiting to be pulled, at the price the catalog holds for it.
                </p>
            </header>

            <PickedLines
                list={list}
                currency={config.currency}
                onDrop={(partId) => { services.picking.drop(partId); }}
                action={list.lines.length === 0
                    ? <Button tone="quiet" onClick={() => { void navigate({ to: "/catalog" }); }}>Open the stock list</Button>
                    : (
                        <Button
                            tone="accent"
                            disabled={list.items === 0}
                            onClick={() => { void navigate({ to: "/cart/handover" }); }}
                        >
                            Hand it over
                        </Button>
                    )}
            />
        </div>
    );
};
