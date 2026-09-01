import type { DemoItem } from "../../types/DemoItem";
import styles from "./ItemRow.module.css";

export type ItemRowProps = {
    item: DemoItem;
    onRemove?: ((id: string) => void) | undefined;
};

export const ItemRow = ({ item, onRemove }: ItemRowProps) =>
{
    return (
        <li className={styles.root} data-status={item.status}>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.status}>{item.status}</span>

            {onRemove !== undefined && (
                <button type="button" className={styles.remove} onClick={() => { onRemove(item.id); }}>Remove</button>
            )}
        </li>
    );
};
