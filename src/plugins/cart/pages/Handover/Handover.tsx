import { useNavigate } from "@tanstack/react-router";

import { useStore } from "@onetype/stack-app-kit/react";
import { Button, Field, Modal } from "@ui";

import { useHandoverForm } from "../../hooks/useHandoverForm";
import { Cart } from "../../index";
import { PickedParts } from "../../sections/PickedParts/PickedParts";
import { PickedLines } from "../../sections/PickedLines/PickedLines";
import styles from "./Handover.module.css";

export const Handover = () =>
{
    const handle = Cart.use();
    const navigate = useNavigate();

    const list = useStore(handle.services.picking.watch, handle.services.picking.read);

    const handing = useHandoverForm();

    const hand = (): void =>
    {
        Cart.handOver(handle, handing.bayName).then(
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

            <PickedParts partIds={list.lines.filter((line) => !line.gone).map((line) => line.partId)} />

            <div className={styles.form}>
                <Field
                    label="Bay"
                    value={handing.bay}
                    hint="Two letters, a hyphen and a number, as painted on the aisle."
                    {...(handing.problem !== undefined && { wrong: handing.problem })}
                    onChange={(event) => { handing.type(event.target.value); }}
                />

                <Button tone="accent" disabled={!handing.ready} onClick={handing.ask}>
                    Hand over
                </Button>
            </div>

            <Modal
                open={handing.sending}
                title="Hand this list over?"
                onClose={handing.drop}
                footer={(
                    <div className={styles.choices}>
                        <Button tone="quiet" onClick={handing.drop}>Keep it here</Button>
                        <Button tone="accent" onClick={hand}>{`Hand it to ${handing.bayName}`}</Button>
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
