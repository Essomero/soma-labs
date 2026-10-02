import { test } from "node:test";
import assert from "node:assert/strict";
import { validateFresh } from "../src/p1_excess_property.mjs";

const SHAPE = { id: "string", balance: "number" };

test("Problem 1: a fresh literal with a stray member is refused, naming the member", () => {
  const result = validateFresh({ id: "a1", balance: 10, owner: "ada" }, SHAPE);
  assert.deepStrictEqual(
    result,
    { ok: false, reason: "excess:owner" },
    `Expected the fresh literal to be refused with "excess:owner", but got ${JSON.stringify(result)}.`,
  );
});

test("Problem 1: a fresh literal that matches the shape exactly is accepted", () => {
  assert.deepStrictEqual(validateFresh({ id: "a1", balance: 10 }, SHAPE), {
    ok: true,
    reason: null,
  });
});

test("Problem 1: a missing member is still reported as missing", () => {
  assert.deepStrictEqual(validateFresh({ id: "a1" }, SHAPE), {
    ok: false,
    reason: "missing:balance",
  });
});
