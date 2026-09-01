import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


import { Demo } from "../../index";

import { ItemList } from "../../sections/ItemList/ItemList";
import { DemoKeys } from "../../utils/DemoKeys";
import styles from "./Dashboard.module.css";

export const Dashboard = () =>
{
    const { services, config } = Demo.use();
    const queryClient = useQueryClient();

    const items = useQuery({
        queryKey: DemoKeys.itemList({ page: 1 }, config.pageSize),
        queryFn: () => services.items.list({ page: 1 }),
    });

    const remove = useMutation({
        mutationFn: (id: string) => services.items.remove(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: DemoKeys.items() }),
    });

    return (
        <div className={styles.root}>
            <header className={styles.head}>
                <p className={styles.eyebrow}>Demo</p>
                <h1 className={styles.title}>Items</h1>
                <p className={styles.body}>Everything this plugin owns, listed.</p>

                <button type="button" onClick={() => { void items.refetch(); }}>Refresh</button>
            </header>

            <div className={styles.body}>
                {items.isPending && <p className={styles.state}>Loading items…</p>}

                {items.isError && (
                    <p className={styles.state} role="alert">
                        Items could not be loaded. {items.error.message}
                    </p>
                )}

                {items.isSuccess && (
                    <ItemList items={items.data.items} onRemove={(id) => { remove.mutate(id); }} />
                )}
            </div>
        </div>
    );
};
