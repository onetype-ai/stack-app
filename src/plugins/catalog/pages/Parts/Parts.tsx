import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useChosenKind } from "../../hooks/useChosenKind";
import { Catalog } from "../../index";
import { PartTable } from "../../sections/PartTable/PartTable";
import { CatalogKeys } from "../../utils/CatalogKeys";
import styles from "./Parts.module.css";

export const Parts = () =>
{
    const { services, config } = Catalog.use();
    const navigate = useNavigate();
    const chosen = useChosenKind();
    const query = chosen.kind === undefined ? {} : { kind: chosen.kind };

    const parts = useQuery({
        queryKey: CatalogKeys.partList(query),
        queryFn: () => services.parts.list(query),
    });

    return (
        <div className={styles.root}>
            <header className={styles.head}>
                <p className={styles.eyebrow}>Catalog</p>
                <h1 className={styles.title}>What the depot stocks</h1>
                <p className={styles.lead}>
                    Every part on the shelves, its price and how many are left.
                </p>
            </header>

            {parts.isError
                ? (
                    <p className={styles.wrong} role="alert">
                        The shelves could not be read. {parts.error.message}
                    </p>
                )
                : (
                    <PartTable
                        parts={parts.data?.parts ?? []}
                        currency={config.currency}
                        lowStock={config.lowStock}
                        kind={chosen.kind}
                        loading={parts.isPending}
                        onKind={chosen.choose}
                        onOpen={(id) => { void navigate({ to: "/catalog/parts/$id", params: { id } }); }}
                    />
                )}
        </div>
    );
};
