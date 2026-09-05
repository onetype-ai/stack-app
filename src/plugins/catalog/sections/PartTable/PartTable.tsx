import { Empty, Select, Skeleton } from "@ui";

import { PartRow } from "../../components/PartRow/PartRow";
import { PartKind } from "../../types/PartKind";
import styles from "./PartTable.module.css";

import type { ReactNode } from "react";
import type { Part } from "../../types/Part";
import type { PartKind as Kind } from "../../types/PartKind";

export type PartTableProps = {
    parts: readonly Part[];
    currency: string;
    lowStock: number;
    kind?: Kind | undefined;
    loading: boolean;
    onKind: (kind: Kind | undefined) => void;
    onOpen: (id: string) => void;
    beside?: ((part: Part) => ReactNode) | undefined;
};

export const PartTable = ({
    parts,
    currency,
    lowStock,
    kind,
    loading,
    onKind,
    onOpen,
    beside,
}: PartTableProps) =>
{
    return (
        <section className={styles.root} aria-label="Stocked parts" aria-busy={loading || undefined}>
            <header className={styles.head}>
                <Select
                    label="Kind"
                    placeholder="Everything stocked"
                    value={kind ?? ""}
                    choices={PartKind.choices()}
                    onChange={(event) =>
                    {
                        const chosen = event.target.value;

                        onKind(chosen === "" ? undefined : PartKind.schema.parse(chosen));
                    }}
                />

                <p className={styles.count}>
                    {loading ? "Counting" : `${String(parts.length)} ${parts.length === 1 ? "part" : "parts"}`}
                </p>
            </header>

            {loading && <div className={styles.waiting}><Skeleton lines={5} /></div>}

            {!loading && parts.length === 0 && (
                <Empty
                    title="Nothing stocked here"
                    hint={kind === undefined ? "The depot holds no parts at all." : "No part of that kind is stocked."}
                />
            )}

            {!loading && parts.length > 0 && (
                <ul className={styles.list}>
                    {parts.map((part) => (
                        <PartRow
                            key={part.id}
                            part={part}
                            currency={currency}
                            lowStock={lowStock}
                            href={`/catalog/parts/${part.id}`}
                            onOpen={onOpen}
                            trailing={beside?.(part)}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
};
