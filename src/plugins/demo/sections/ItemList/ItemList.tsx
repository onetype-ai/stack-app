import { useState } from "react";


import { ItemRow } from "../../components/ItemRow/ItemRow";
import type { DemoItem } from "../../types/DemoItem";
import styles from "./ItemList.module.css";

export type ItemListProps = {
    items: readonly DemoItem[];
    onRemove?: ((id: string) => void) | undefined;
};

export const ItemList = ({ items, onRemove }: ItemListProps) =>
{
    const [filter, setFilter] = useState("");

    const needle = filter.trim().toLowerCase();
    const visible = needle === "" ? items : items.filter((item) => item.title.toLowerCase().includes(needle));

    return (
        <div className={styles.root}>
            <label className={styles.filter}>
                Filter
                <input value={filter} onChange={(event) => { setFilter(event.target.value); }} />
            </label>

            {visible.length === 0
                ? <p className={styles.empty}>{items.length === 0 ? "No items yet." : "Nothing matches that filter."}</p>
                : (
                    <ul className={styles.list}>
                        {visible.map((item) => <ItemRow key={item.id} item={item} onRemove={onRemove} />)}
                    </ul>
                )}
        </div>
    );
};
