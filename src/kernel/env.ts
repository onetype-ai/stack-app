export const Env = {
    text: (name: string, fallback?: string): string | undefined =>
    {
        const value: unknown = import.meta.env[name];

        if (value === undefined)
        {
            return fallback;
        }

        if (typeof value !== "string" || value.length === 0)
        {
            throw new Error(`${name} must be a non-empty string when it is set.`);
        }

        return value;
    },

    required: (name: string): string =>
    {
        const value = Env.text(name);

        if (value === undefined)
        {
            throw new Error(`${name} is required and was not set.`);
        }

        return value;
    },
};
