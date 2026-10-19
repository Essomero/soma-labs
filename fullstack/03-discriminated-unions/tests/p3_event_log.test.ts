import { test } from "node:test";
import assert from "node:assert/strict";
import { formatEvent } from "../src/p3_event_log.ts";

function outcome(fn: () => unknown): string {
  try {
    return `returned ${JSON.stringify(fn())}`;
  } catch (error: any) {
    return `threw ${error.message}`;
  }
}

test("Problem 3: a login event formats user id", () => {
  assert.strictEqual(
    formatEvent({ type: "login", userId: "u_42" }),
    "login user=u_42",
  );
});

test("Problem 3: an export event formats row count", () => {
  assert.strictEqual(
    formatEvent({ type: "export", rows: 1250 }),
    "export rows=1250",
  );
});

test("Problem 3: a new event type reaches the exhaustive branch, not an empty line", () => {
  const logout = { type: "logout", userId: "u_42" } as any;
  assert.throws(
    () => formatEvent(logout),
    /unhandled case/,
    `Expected a new event type to be refused as unreachable, but the call ${outcome(() => formatEvent(logout))}.`,
  );
});
