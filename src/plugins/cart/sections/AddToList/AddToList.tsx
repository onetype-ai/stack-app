import { useState } from "react";

import { useHearing, useKept } from "@onetype/stack-app-kit/react";
import { Badge, Button } from "@ui";

import { Cart } from "../../index";
import styles from "./AddToList.module.css";

import type { Beside, Withdrawal } from "@plugins/catalog";

export type AddToListProps = {
    payload: unknown;
};

export const AddToList = ({ payload }: AddToListProps) =>
{
    const { services } = Cart.use();
    const part = payload as Beside;

    const [wrong, setWrong] = useState<string | undefined>(undefined);
    const [pulled, setPulled] = useState(false);

    const list = useKept(services.picking.watch, services.picking.read);
    const holding = list.lines.find((line) => line.partId === part.id && !line.gone);

    useHearing("cart", "catalog.part.withdrawn", (told) =>
    {
        if ((told as Withdrawal).id === part.id)
        {
            setPulled(true);
        }
    });

    const add = (): void =>
    {
        setWrong(undefined);

        services.picking.add(part.id, part.name).catch((cause: unknown) =>
        {
            setWrong(cause instanceof Error ? cause.message : String(cause));
        });
    };

    return (
        <div className={styles.root}>
            <div className={styles.line}>
                <p className={styles.label}>Pick list</p>

                {holding !== undefined && (
                    <Badge tone="accent">{`${String(holding.quantity)} on the list`}</Badge>
                )}
            </div>

            <Button
                tone="accent"
                disabled={pulled}
                onClick={add}
            >
                {holding === undefined ? "Add to pick list" : "Add another"}
            </Button>

            {pulled && (
                <p className={styles.note} role="status">
                    This part just left the shelves, so nothing more can be picked.
                </p>
            )}

            {wrong !== undefined && <p className={styles.wrong} role="alert">{wrong}</p>}
        </div>
    );
};
