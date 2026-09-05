import styles from "./Skeleton.module.css";

export type SkeletonProps = {
    /** How many bars. One line of a list is one bar. */
    lines?: number;
};

/**
 * A shape standing in for what is loading.
 *
 * Hidden from a screen reader: the region it fills says it is busy, and
 * reading "loading" once beats reading a bar four times.
 */
export const Skeleton = ({ lines = 1 }: SkeletonProps) =>
{
    return (
        <div className={styles.root} aria-hidden="true">
            {Array.from({ length: lines }, (_one, at) => (
                <span key={at} className={styles.bar} />
            ))}
        </div>
    );
};
