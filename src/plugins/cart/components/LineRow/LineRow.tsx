import { Badge, Button } from "@ui";

import { Money } from "../../utils/Money";
import styles from "./LineRow.module.css";

import type { Line } from "../../types/Line";

export type LineRowProps = {
    line: Line;
    currency: string;
    onDrop?: ((partId: string) => void) | undefined;
};

export const LineRow = ({ line, currency, onDrop }: LineRowProps) =>
{
    return (
        <li className={styles.root} data-gone={line.gone || undefined}>
            <div className={styles.identity}>
                <span className={styles.name}>{line.name}</span>

                {line.gone
                    ? <Badge tone="danger">Off the shelves</Badge>
                    : <span className={styles.each}>{`${Money.format(line.cents, currency)} each`}</span>}
            </div>

            <span className={styles.quantity}>{`x${String(line.quantity)}`}</span>

            <span className={styles.sum}>
                {line.gone ? "" : Money.format(line.cents * line.quantity, currency)}
            </span>

            {onDrop !== undefined && (
                <Button
                    tone="plain"
                    size="small"
                    onClick={() => { onDrop(line.partId); }}
                    aria-label={`Take ${line.name} off the list`}
                >
                    Remove
                </Button>
            )}
        </li>
    );
};
