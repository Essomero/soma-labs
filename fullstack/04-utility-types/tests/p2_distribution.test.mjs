import { test } from "node:test";
import assert from "node:assert/strict";
import { myExclude, myNonNullable } from "../src/p2_distribution.mjs";

test("Problem 2: Exclude filters one member at a time", () => {
  const kept = myExclude(["a", "b"], ["a", "c"]);
  assert.deepStrictEqual(
    kept,
    ["b"],
    `Expected Exclude<'a' | 'b', 'a' | 'c'> to keep "b", but got ${JSON.stringify(kept)}.`,
  );
});

test("Problem 2: Exclude still removes every covered member", () => {
  const kept = myExclude(["red", "green", "blue"], ["green"]);
  assert.deepStrictEqual(
    kept,
    ["red", "blue"],
    `Expected the covered member to be removed, but got ${JSON.stringify(kept)}.`,
  );
});

test("Problem 2: Exclude drops the whole union only when every member is covered", () => {
  assert.deepStrictEqual(myExclude(["a", "b"], ["a", "b"]), []);
});

test("Problem 2: NonNullable removes null and undefined", () => {
  assert.deepStrictEqual(myNonNullable(["a", null, undefined, "b"]), ["a", "b"]);
});
