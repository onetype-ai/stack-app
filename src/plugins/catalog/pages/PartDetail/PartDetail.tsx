import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

import { Slot } from "@onetype/stack-app-kit/react";
import { Badge, Button, Skeleton } from "@ui";

import { Catalog } from "../../index";
import { PartId } from "../../types/PartId";
import { PartKind } from "../../types/PartKind";
import { CatalogKeys } from "../../utils/CatalogKeys";
import { Money } from "@utils/Money";
import styles from "./PartDetail.module.css";

export const PartDetail = () =>
{
    const params: unknown = useParams({ strict: false });
    const id = PartId.parse((params as Record<string, unknown>)["id"]);
    const { services, config, permissions } = Catalog.use();
    const navigate = useNavigate();

    const part = useQuery({
        queryKey: CatalogKeys.part(id),
        queryFn: () => services.parts.get(id),
    });

    const withdraw = useMutation({
        mutationFn: () => services.parts.withdraw(id),
        onSuccess: () => { void navigate({ to: "/catalog" }); },
    });

    return (
        <article className={styles.root}>
            <header>
                <p className={styles.eyebrow}>{part.data === undefined ? "Part" : PartKind.label(part.data.kind)}</p>

                <h1 className={styles.title}>
                    {part.isPending ? <Skeleton /> : part.data?.name ?? "Unknown part"}
                </h1>
            </header>

            {part.isError && (
                <p className={styles.wrong} role="alert">
                    This part could not be read. {part.error.message}
                </p>
            )}

            {part.isSuccess && (
                <div className={styles.body}>
                    <dl className={styles.facts}>
                        <div className={styles.fact}>
                            <dt className={styles.term}>Price</dt>
                            <dd className={styles.value}>{Money.format(part.data.cents, config.currency)}</dd>
                        </div>

                        <div className={styles.fact}>
                            <dt className={styles.term}>On the shelf</dt>
                            <dd className={styles.value}>
                                <Badge tone={part.data.stock === 0 ? "danger" : part.data.stock <= config.lowStock ? "caution" : "success"}>
                                    {part.data.stock === 0 ? "Out of stock" : `${String(part.data.stock)} in stock`}
                                </Badge>
                            </dd>
                        </div>
                    </dl>

                    <aside className={styles.aside} aria-label="What else this part is part of">
                        <Slot name="catalog.part.aside" payload={{ id: part.data.id, name: part.data.name, cents: part.data.cents }} />
                    </aside>

                    {permissions.has("catalog.write") && (
                        <footer className={styles.foot}>
                            <Button
                                tone="danger"
                                busy={withdraw.isPending}
                                onClick={() => { withdraw.mutate(); }}
                            >
                                Withdraw from stock
                            </Button>

                            {withdraw.isError && (
                                <p className={styles.refused} role="alert">{withdraw.error.message}</p>
                            )}
                        </footer>
                    )}
                </div>
            )}
        </article>
    );
};
