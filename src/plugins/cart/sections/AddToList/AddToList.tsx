import { useState } from "react";

import { useEvent, useStore } from "@onetype/stack-app-kit/react";
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

    const [problem, setProblem] = useState<string | undefined>(undefined);
    const [pulled, setPulled] = useState(false);

    const list = useStore(services.picking.watch, services.picking.read);
    const onList = list.lines.find((line) => line.partId === part.id && !line.gone);

    useEvent("cart", "catalog.part.withdrawn", (payload) =>
    {
        if ((payload as Withdrawal).id === part.id)
        {
            setPulled(true);
        }
    });

    const add = (): void =>
    {
        setProblem(undefined);

        services.picking.add(part.id, part.name).catch((cause: unknown) =>
        {
            setProblem(cause instanceof Error ? cause.message : String(cause));
        });
    };

    return (
        <div className={styles.root}>
            <div className={styles.line}>
                <p className={styles.label}>Pick list</p>

                {onList !== undefined && (
                    <Badge tone="accent">{`${String(onList.quantity)} on the list`}</Badge>
                )}
            </div>

            <Button
                tone="accent"
                disabled={pulled}
                onClick={add}
            >
                {onList === undefined ? "Add to pick list" : "Add another"}
            </Button>

            {pulled && (
                <p className={styles.note} role="status">
                    This part just left the shelves, so nothing more can be picked.
                </p>
            )}

            {problem !== undefined && <p className={styles.problem} role="alert">{problem}</p>}
        </div>
    );
};
