import { useQueries } from "@tanstack/react-query";

import { Catalog, PartRow } from "@plugins/catalog";
import { Skeleton } from "@ui";

import { Cart } from "../../index";
import styles from "./AsTheDepotHasIt.module.css";

import type { Part } from "@plugins/catalog";

export type AsTheDepotHasItProps = {
    partIds: readonly string[];
};

// The row is the catalog's own component, so a part looks the same wherever
// it is shown, and the cart never learns what a part is made of.
export const AsTheDepotHasIt = ({ partIds }: AsTheDepotHasItProps) =>
{
    const handle = Cart.use();

    const parts = useQueries({
        queries: partIds.map((id) =>
        {
            return {
                queryKey: ["cart", "as-stocked", id],
                queryFn: () => Catalog.partOf(handle, id),
            };
        }),
    });

    const found = parts
        .map((one) => one.data)
        .filter((one): one is Part => one !== undefined);

    return (
        <section className={styles.root} aria-label="Each line as the depot holds it">
            <h2 className={styles.title}>As the depot holds them</h2>

            {parts.some((one) => one.isPending)
                ? <div className={styles.waiting}><Skeleton lines={partIds.length} /></div>
                : (
                    <ul className={styles.list}>
                        {found.map((part) => (
                            <PartRow
                                key={part.id}
                                part={part}
                                currency={handle.config.currency}
                                lowStock={0}
                            />
                        ))}
                    </ul>
                )}
        </section>
    );
};
