import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { useHandoverForm } from "../hooks/useHandoverForm";

describe("where a list is going", () =>
{
    test("is nowhere until something is typed, so nothing can be handed over yet", () =>
    {
        const { result } = renderHook(() => useHandoverForm());

        expect(result.current.ready).toBe(false);
    });

    test("takes a bay as it is painted, however it was typed", () =>
    {
        const { result } = renderHook(() => useHandoverForm());

        act(() => { result.current.type("ac-12"); });

        expect(result.current.bayName).toBe("AC-12");
        expect(result.current.ready).toBe(true);
    });

    /**
     * The refusal arrives while the field is still in reach. Checking only at
     * the command puts it after a modal the reader has already confirmed.
     */
    test("and stays not ready for something that is not a bay", () =>
    {
        const { result } = renderHook(() => useHandoverForm());

        act(() => { result.current.type("aisle twelve"); });

        expect(result.current.ready).toBe(false);
    });

    test("asks before it hands anything over", () =>
    {
        const { result } = renderHook(() => useHandoverForm());

        expect(result.current.sending).toBe(false);

        act(() => { result.current.ask(); });

        expect(result.current.sending).toBe(true);

        act(() => { result.current.drop(); });

        expect(result.current.sending).toBe(false);
    });

    test("shows what refused it, and stops asking", () =>
    {
        const { result } = renderHook(() => useHandoverForm());

        act(() =>
        {
            result.current.ask();
            result.current.refuse(new Error("That bay is closed."));
        });

        expect(result.current.sending).toBe(false);
        expect(result.current.problem).toBe("That bay is closed.");
    });

    test("and clears it the moment the reader types again", () =>
    {
        const { result } = renderHook(() => useHandoverForm());

        act(() => { result.current.refuse(new Error("That bay is closed.")); });
        act(() => { result.current.type("AC-13"); });

        expect(result.current.problem).toBeUndefined();
    });
});
