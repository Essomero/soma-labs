/**
 * Async state as a union of mutually exclusive members.
 *
 * idle | loading | success | error: the states cannot overlap, so no value can
 * carry both data and an error, or two load flags true at once.
 */

import { assertNever } from "./dispatcher.mjs";

export const idle = () => ({ status: "idle" });

export const loading = () => ({ status: "loading" });

export const success = (data) => ({ status: "success", data });

export const failure = (error) => ({
  status: "error",
  error: error instanceof Error ? error : new Error(String(error)),
});

export function view(state) {
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
      return assertNever(state);
  }
}
