export const formatDate = {
    absolute: (iso: string, locale?: string): string =>
    {
        const date = new Date(iso);

        if (Number.isNaN(date.getTime()))
        {
            return "";
        }

        return new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    },

    relative: (iso: string, now: Date = new Date(), locale?: string): string =>
    {
        const date = new Date(iso);

        if (Number.isNaN(date.getTime()))
        {
            return "";
        }

        const units = [
            ["year", 31536000000],
            ["month", 2592000000],
            ["day", 86400000],
            ["hour", 3600000],
            ["minute", 60000],
        ] as const;

        const elapsed = date.getTime() - now.getTime();
        const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

        for (const [unit, ms] of units)
        {
            if (Math.abs(elapsed) >= ms)
            {
                return formatter.format(Math.round(elapsed / ms), unit);
            }
        }

        return formatter.format(0, "minute");
    },
};
