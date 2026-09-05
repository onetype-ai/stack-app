import { Empty } from "@ui";

import { LineRow } from "../../components/LineRow/LineRow";
import { Money } from "../../utils/Money";
import styles from "./PickedLines.module.css";

import type { ReactNode } from "react";
import type { PickList } from "../../types/PickList";

export type PickedLinesProps = {
    list: PickList;
    currency: string;
    onDrop?: ((partId: string) => void) | undefined;
    action?: ReactNode;
};

export const PickedLines = ({ list, currency, onDrop, action }: PickedLinesProps) =>
{
    if (list.lines.length === 0)
    {
        return (
            <section className={styles.root}>
                <Empty
                    title="Nothing picked yet"
                    hint="Open a part in the stock list and add it from there."
                    action={action}
                />
            </section>
        );
    }

    return (
        <section className={styles.root}>
            <ul className={styles.list}>
                {list.lines.map((line) => (
                    <LineRow key={line.partId} line={line} currency={currency} onDrop={onDrop} />
                ))}
            </ul>

            <footer className={styles.foot}>
                <div className={styles.totals}>
                    <span className={styles.term}>{`${String(list.items)} ${list.items === 1 ? "item" : "items"}`}</span>
                    <span className={styles.sum}>{Money.format(list.cents, currency)}</span>
                </div>

                {action}
            </footer>
        </section>
    );
};
