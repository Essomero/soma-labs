/**
 * Async state as a union of mutually exclusive members.
 *
 * idle | loading | success | error: the states cannot overlap, so no value can
 * carry both data and an error, or two load flags true at once.
 */

import { assertNever } from "./dispatcher.ts";

export type IdleState = { status: "idle" };
export type LoadingState = { status: "loading" };
export type SuccessState<T> = { status: "success"; data: T };
export type ErrorState = { status: "error"; error: Error };

export type AsyncState<T> =
  | IdleState
  | LoadingState
  | SuccessState<T>
  | ErrorState;

export const idle = (): IdleState => ({ status: "idle" });

export const loading = (): LoadingState => ({ status: "loading" });

export const success = <T>(data: T): SuccessState<T> => ({ status: "success", data });

export const failure = (error: unknown): ErrorState => ({
  status: "error",
  error: error instanceof Error ? error : new Error(String(error)),
});

export type ViewResult<T> =
  | { kind: "placeholder"; text: string }
  | { kind: "spinner"; text: string }
  | { kind: "data"; value: T }
  | { kind: "error"; message: string };

export function view<T>(state: AsyncState<T>): ViewResult<T> {
  switch (state.status) {
    case "idle":
      return { kind: "placeholder", text: "Nothing requested yet" };
    case "loading":
      return { kind: "spinner", text: "Loading…" };
    case "success":
      return { kind: "data", value: state.data };
    case "error":
      return { kind: "error", message: state.error.message };
    default:
      return assertNever(state as never);
  }
}
