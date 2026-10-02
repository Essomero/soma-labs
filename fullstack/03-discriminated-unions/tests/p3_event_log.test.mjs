import { test } from "node:test";
import assert from "node:assert/strict";
import { formatEvent } from "../src/p3_event_log.mjs";

function outcome(fn) {
  try {
    return `returned ${JSON.stringify(fn())}`;
  } catch (error) {
    return `threw ${error.message}`;
  }
}

test("Problem 3: a login event names the user", () => {
  assert.strictEqual(formatEvent({ type: "login", userId: "u1" }), "login user=u1");
});

test("Problem 3: an export event reports its row count", () => {
  assert.strictEqual(formatEvent({ type: "export", rows: 120 }), "export rows=120");
});

test("Problem 3: a new event type is a handled gap, not a silent empty line", () => {
  const payment = { type: "payment", amountCents: 500 };
  assert.throws(
    () => formatEvent(payment),
    /unhandled case/,
    `Expected a new event type to be refused as unhandled, but the call ${outcome(() => formatEvent(payment))}.`,
  );
});
