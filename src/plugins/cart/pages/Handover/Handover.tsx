import { useNavigate } from "@tanstack/react-router";

import { useKept } from "@onetype/stack-app-kit/react";
import { Button, Field, Modal } from "@ui";

import { useHandingOver } from "../../hooks/useHandingOver";
import { Cart } from "../../index";
import { AsTheDepotHasIt } from "../../sections/AsTheDepotHasIt/AsTheDepotHasIt";
import { PickedLines } from "../../sections/PickedLines/PickedLines";
import styles from "./Handover.module.css";

export const Handover = () =>
{
    const handle = Cart.use();
    const navigate = useNavigate();

    const list = useKept(handle.services.picking.watch, handle.services.picking.read);

    const handing = useHandingOver();

    const hand = (): void =>
    {
        Cart.handOver(handle, handing.named).then(
            () =>
            {
                handing.drop();
                void navigate({ to: "/catalog" });
            },
            handing.refuse,
        );
    };

    return (
        <div className={styles.root}>
            <header className={styles.head}>
                <p className={styles.eyebrow}>Cart</p>
                <h1 className={styles.title}>Hand the list over</h1>
                <p className={styles.lead}>Say which bay pulls it, and the list leaves the desk.</p>
            </header>

            <PickedLines list={list} currency={handle.config.currency} />

            <AsTheDepotHasIt partIds={list.lines.filter((line) => !line.gone).map((line) => line.partId)} />

            <div className={styles.form}>
                <Field
                    label="Bay"
                    value={handing.bay}
                    hint="Two letters, a hyphen and a number, as painted on the aisle."
                    {...(handing.wrong !== undefined && { wrong: handing.wrong })}
                    onChange={(event) => { handing.type(event.target.value); }}
                />

                <Button tone="accent" disabled={!handing.ready} onClick={handing.ask}>
                    Hand over
                </Button>
            </div>

            <Modal
                open={handing.asking}
                title="Hand this list over?"
                onClose={handing.drop}
                footer={(
                    <div className={styles.choices}>
                        <Button tone="quiet" onClick={handing.drop}>Keep it here</Button>
                        <Button tone="accent" onClick={hand}>{`Hand it to ${handing.named}`}</Button>
                    </div>
                )}
            >
                <p className={styles.body}>
                    {`${String(list.items)} ${list.items === 1 ? "item" : "items"} leave the desk and the list is emptied.`}
                </p>
            </Modal>
        </div>
    );
};
