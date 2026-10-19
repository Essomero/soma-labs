import { test } from "node:test";
import assert from "node:assert/strict";
import { failure, idle, loading, success, view } from "../src/async_state.ts";

test("each state renders its own view: data and error never coexist", () => {
  assert.deepStrictEqual(view(idle()), {
    kind: "placeholder",
    text: "Nothing requested yet",
  });
  assert.deepStrictEqual(view(loading()), { kind: "spinner", text: "Loading…" });
  assert.deepStrictEqual(view(success({ id: 1 })), {
    kind: "data",
    value: { id: 1 },
  });
  assert.deepStrictEqual(view(failure(new Error("network down"))), {
    kind: "error",
    message: "network down",
  });
});

test("a non-Error failure is normalized into an Error", () => {
  const err = failure("plain string failure");
  assert.ok(err.error instanceof Error);
  assert.strictEqual(err.error.message, "plain string failure");
});

test("an unknown status falls through to the exhaustive branch", () => {
  assert.throws(() => view({ status: "bogus" } as any), /unhandled case/);
});
