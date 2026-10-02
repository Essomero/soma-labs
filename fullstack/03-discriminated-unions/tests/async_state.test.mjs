import { test } from "node:test";
import assert from "node:assert/strict";
import { failure, idle, loading, success, view } from "../src/async_state.mjs";

test("each state renders its own view — data and error never coexist", () => {
  assert.deepStrictEqual(view(idle()), {
    kind: "placeholder",
    text: "Nothing requested yet",
  });
  assert.deepStrictEqual(view(loading()), { kind: "spinner", text: "Loading…" });
  assert.deepStrictEqual(view(success([1, 2])), { kind: "data", value: [1, 2] });
  assert.deepStrictEqual(view(failure(new Error("boom"))), {
    kind: "error",
    message: "boom",
  });
});

test("a non-Error failure is normalized into an Error", () => {
  const state = failure("boom");
  assert.ok(state.error instanceof Error);
  assert.strictEqual(state.error.message, "boom");
});

test("an unknown status falls through to the exhaustive branch", () => {
  assert.throws(() => view({ status: "refreshing" }), /unhandled case/);
});
