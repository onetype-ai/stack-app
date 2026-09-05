export const Money = {
    format: (cents: number, currency: string, locale?: string): string =>
    {
        if (!Number.isFinite(cents))
        {
            return "";
        }

        return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
    },
};
