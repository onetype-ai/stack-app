import { useId, useRef } from "react";

import { useDismiss, useFocusTrap } from "@onetype/stack-app-kit/react";

import { Button } from "../Button/Button";
import styles from "./Modal.module.css";

import type { ReactNode } from "react";

export type ModalProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
};

/**
 * A layer over the page, and the two ways out of it.
 *
 * The trap and the dismiss come from the kit: escape and a click outside both
 * close, and tab cannot leave. Written here a second time, they would be
 * written slightly differently.
 */
export const Modal = ({ open, title, onClose, children, footer }: ModalProps) =>
{
    const id = useId();
    const panel = useRef<HTMLDivElement>(null);

    useFocusTrap(open, panel);
    useDismiss(open, panel, undefined, onClose);

    if (!open)
    {
        return null;
    }

    return (
        <div className={styles.over}>
            <div
                ref={panel}
                className={styles.panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby={id}
            >
                <div className={styles.head}>
                    <h2 id={id} className={styles.title}>{title}</h2>

                    <Button tone="plain" size="small" onClick={onClose} aria-label="Close">
                        ✕
                    </Button>
                </div>

                <div className={styles.body}>{children}</div>

                {footer !== undefined && <div className={styles.foot}>{footer}</div>}
            </div>
        </div>
    );
};
