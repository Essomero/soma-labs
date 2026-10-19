import { test } from "node:test";
import assert from "node:assert/strict";
import {
  arrayOf,
  fnOf,
  inferElement,
  inferReturn,
  isString,
  matchEach,
  myExclude,
  myNonNullable,
} from "../src/conditional_types.ts";

test("Exclude<T, U> filters per member, so only the covered ones vanish", () => {
  assert.deepStrictEqual(myExclude(["a", "b"], ["a", "c"]), ["b"]);
  assert.deepStrictEqual(myExclude(["red", "green", "blue"], ["green"]), ["red", "blue"]);
});

test("Exclude<T, U> drops everything when the exclusion set covers the union", () => {
  assert.deepStrictEqual(myExclude(["a", "b"], ["a", "b"]), []);
});

test("NonNullable<T> is the same recipe with a fixed exclusion set", () => {
  assert.deepStrictEqual(myNonNullable(["a", null, undefined, "b"]), ["a", "b"]);
});

test("a conditional distributes over the union and re-unions the answers", () => {
  assert.strictEqual(matchEach(["a", "b"], isString), true);
  assert.strictEqual(matchEach(["a", 1], isString), "boolean");
});

test("infer destructures the array pattern, or yields never when it did not match", () => {
  assert.strictEqual(inferElement(arrayOf("string")), "string");
  assert.strictEqual(inferElement({ kind: "other" }), "never");
});

test("infer destructures the signature pattern the same way", () => {
  assert.strictEqual(inferReturn(fnOf("string")), "string");
  assert.strictEqual(inferReturn(arrayOf("number")), "never");
});
