import { useQuery } from "@tanstack/react-query";

import { useParams } from "@tanstack/react-router";


import { Demo } from "../../index";

import { DemoItemId } from "../../types/DemoItemId";
import { DemoKeys } from "../../utils/DemoKeys";
import { Dates } from "../../utils/Dates";

import styles from "./ItemDetail.module.css";

export const ItemDetail = () =>
{
    const params: unknown = useParams({ strict: false });
    const id = DemoItemId.parse((params as Record<string, unknown>)["id"]);
    const { services } = Demo.use();

    const item = useQuery({
        queryKey: DemoKeys.item(id),
        queryFn: () => services.items.get(id),
    });

    return (
        <div className={styles.root}>
            <header className={styles.head}>
                <p className={styles.eyebrow}>Demo</p>
                <h1 className={styles.title}>{item.data?.title ?? "Item"}</h1>
            </header>

            <div className={styles.body}>
                {item.isPending && <p className={styles.state}>Loading item…</p>}

                {item.isError && (
                    <p className={styles.state} role="alert">
                        This item could not be loaded. {item.error.message}
                    </p>
                )}

                {item.isSuccess && (
                    <dl className={styles.detail}>
                        <dt className={styles.term}>Status</dt>
                        <dd className={styles.value}>{item.data.status}</dd>

                        <dt className={styles.term}>Created</dt>
                        <dd className={styles.value}>{Dates.absolute(item.data.createdAt)}</dd>
                    </dl>
                )}
            </div>
        </div>
    );
};
