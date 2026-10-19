import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize } from "../src/p1_api_response.ts";

function outcome(fn: () => unknown): string {
  try {
    return `returned ${JSON.stringify(fn())}`;
  } catch (error: any) {
    return `threw ${error.message}`;
  }
}

test("Problem 1: a paid response summarizes with its id", () => {
  assert.strictEqual(summarize({ status: "paid", id: "p_123" }), "paid p_123");
});

test("Problem 1: a pending response asks for the next action", () => {
  assert.strictEqual(
    summarize({ status: "pending" }),
    "pending action required",
  );
});

test("Problem 1: a failed response names the error code", () => {
  assert.strictEqual(
    summarize({ status: "failed", errorCode: "card_declined" }),
    "failed card_declined",
  );
});

test("Problem 1: a status the union does not cover is unreachable, not a failure", () => {
  const refunded = { status: "refunded", id: "p_123" } as any;
  assert.throws(
    () => summarize(refunded),
    /unhandled case/,
    `Expected an uncovered status to be refused as unreachable, but the call ${outcome(() => summarize(refunded))}.`,
  );
});
