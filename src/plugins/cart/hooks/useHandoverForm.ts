import { useState } from "react";

import { Bay } from "../types/Bay";

export type HandoverForm = {
    bay: string;
    bayName: string;
    ready: boolean;
    sending: boolean;
    problem: string | undefined;
    type: (raw: string) => void;
    ask: () => void;
    drop: () => void;
    refuse: (cause: unknown) => void;
};

// The bay is checked as it is typed, so the refusal arrives beside the field
// rather than after a modal has already been confirmed.
export const useHandoverForm = (): HandoverForm =>
{
    const [bay, setBay] = useState("");
    const [sending, setSending] = useState(false);
    const [problem, setProblem] = useState<string | undefined>(undefined);

    const bayName = bay.trim().toUpperCase();
    const ready = Bay.schema.safeParse(bayName).success;

    return {
        bay,
        bayName,
        ready,
        sending,
        problem,

        type: (raw: string): void =>
        {
            setProblem(undefined);
            setBay(raw);
        },

        ask: (): void =>
        {
            setSending(true);
        },

        drop: (): void =>
        {
            setSending(false);
        },

        refuse: (cause: unknown): void =>
        {
            setSending(false);
            setProblem(cause instanceof Error ? cause.message : String(cause));
        },
    };
};
