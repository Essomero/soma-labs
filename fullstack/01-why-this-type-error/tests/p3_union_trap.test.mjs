import { test } from "node:test";
import assert from "node:assert/strict";
import { label } from "../src/p3_union_trap.mjs";

test("Problem 3: a view event labels with its page", () => {
  const result = label({ type: "view", page: "/home" });
  assert.strictEqual(
    result,
    "view:/home",
    `Expected "view:/home" for a view event, but got ${JSON.stringify(result)}.`,
  );
});

test("Problem 3: a click event labels with its coordinates", () => {
  const result = label({ type: "click", target: "#buy", x: 120, y: 40 });
  assert.strictEqual(
    result,
    "click:120,40",
    `Expected "click:120,40" for a click event, but got ${JSON.stringify(result)}.`,
  );
});
