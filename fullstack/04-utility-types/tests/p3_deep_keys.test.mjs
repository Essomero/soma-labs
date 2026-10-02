import { test } from "node:test";
import assert from "node:assert/strict";
import { deepKeys } from "../src/p3_deep_keys.mjs";

test("Problem 3: nested leaves keep the full path", () => {
  const form = { id: "u1", user: { name: "ada", address: { city: "Kampala" } } };
  const paths = deepKeys(form);
  assert.deepStrictEqual(
    paths,
    ["id", "user.name", "user.address.city"],
    `Expected nested leaves to be addressed by their full path, but got ${JSON.stringify(paths)}.`,
  );
});

test("Problem 3: a single nested object still reports prefixed paths", () => {
  const paths = deepKeys({ a: { b: 1 } });
  assert.deepStrictEqual(
    paths,
    ["a.b"],
    `Expected the nested leaf to keep its parent's prefix, but got ${JSON.stringify(paths)}.`,
  );
});

test("Problem 3: an empty object and an array are leaves of their own", () => {
  assert.deepStrictEqual(deepKeys({ empty: {}, list: [1, 2] }), ["empty", "list"]);
});
