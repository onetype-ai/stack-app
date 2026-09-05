import { Badge } from "@ui";

import { PartKind } from "../../types/PartKind";
import { Money } from "../../utils/Money";
import styles from "./PartRow.module.css";

import type { ReactNode } from "react";
import type { Part } from "../../types/Part";

export type PartRowProps = {
    part: Part;
    currency: string;
    lowStock: number;
    href?: string | undefined;
    trailing?: ReactNode;
    onOpen?: ((id: string) => void) | undefined;
};

export const PartRow = ({ part, currency, lowStock, href, trailing, onOpen }: PartRowProps) =>
{
    const shortage = part.stock === 0 ? "none" : part.stock <= lowStock ? "low" : "held";

    return (
        <li className={styles.root} data-stock={shortage}>
            <div className={styles.identity}>
                {href === undefined
                    ? <span className={styles.name}>{part.name}</span>
                    : (
                        <a
                            className={styles.name}
                            href={href}
                            onClick={(event) =>
                            {
                                if (onOpen === undefined || event.metaKey || event.ctrlKey)
                                {
                                    return;
                                }

                                event.preventDefault();
                                onOpen(part.id);
                            }}
                        >
                            {part.name}
                        </a>
                    )}

                <span className={styles.kind}>{PartKind.label(part.kind)}</span>
            </div>

            <span className={styles.price}>{Money.format(part.cents, currency)}</span>

            <Badge tone={shortage === "none" ? "danger" : shortage === "low" ? "caution" : "neutral"}>
                {shortage === "none" ? "Out of stock" : `${String(part.stock)} in stock`}
            </Badge>

            <div className={styles.trailing}>{trailing}</div>
        </li>
    );
};
