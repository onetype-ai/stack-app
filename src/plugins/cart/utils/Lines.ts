import type { Line } from "../types/Line";

export const Lines = {
    cents: (lines: readonly Line[]): number =>
    {
        return lines
            .filter((line) => !line.gone)
            .reduce((sum, line) => sum + line.cents * line.quantity, 0);
    },

    items: (lines: readonly Line[]): number =>
    {
        return lines
            .filter((line) => !line.gone)
            .reduce((sum, line) => sum + line.quantity, 0);
    },

    holds: (lines: readonly Line[], partId: string): boolean =>
    {
        return lines.some((line) => line.partId === partId && !line.gone);
    },
};
