import { useState } from "react";

import { Bay } from "../types/Bay";

export type HandingOver = {
    bay: string;
    named: string;
    ready: boolean;
    asking: boolean;
    wrong: string | undefined;
    type: (raw: string) => void;
    ask: () => void;
    drop: () => void;
    refuse: (cause: unknown) => void;
};

// The bay is checked as it is typed, so the refusal arrives beside the field
// rather than after a modal has already been confirmed.
export const useHandingOver = (): HandingOver =>
{
    const [bay, setBay] = useState("");
    const [asking, setAsking] = useState(false);
    const [wrong, setWrong] = useState<string | undefined>(undefined);

    const named = bay.trim().toUpperCase();
    const ready = Bay.schema.safeParse(named).success;

    return {
        bay,
        named,
        ready,
        asking,
        wrong,

        type: (raw: string): void =>
        {
            setWrong(undefined);
            setBay(raw);
        },

        ask: (): void =>
        {
            setAsking(true);
        },

        drop: (): void =>
        {
            setAsking(false);
        },

        refuse: (cause: unknown): void =>
        {
            setAsking(false);
            setWrong(cause instanceof Error ? cause.message : String(cause));
        },
    };
};
