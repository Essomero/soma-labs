import { test } from "node:test";
import assert from "node:assert/strict";
import { getById } from "../src/p1_constrained_wrapper.ts";

const USERS = [
  { id: "u1", name: "ada" },
  { id: "u2", name: "grace" },
];

function outcome(fn: () => unknown): string {
  try {
    return `returned ${JSON.stringify(fn())}`;
  } catch (error: any) {
    return `threw ${error.message}`;
  }
}

test("Problem 1: the matching item is returned", () => {
  assert.deepStrictEqual(getById(USERS, "u2"), { id: "u2", name: "grace" });
});

test("Problem 1: a list with no match returns undefined, not a throw", () => {
  assert.strictEqual(getById(USERS, "u9"), undefined);
});

test("Problem 1: an item that does not satisfy the constraint is refused, naming the index", () => {
  const malformed = [{ id: "u1" }, { name: "ghost" }] as any;
  assert.throws(
    () => getById(malformed, "u1"),
    /item at index 1 does not satisfy \{ id: string \}/,
    `Expected the malformed list to be refused with "item at index 1 does not satisfy { id: string }", but the call ${outcome(() => getById(malformed, "u1"))}.`,
  );
});
