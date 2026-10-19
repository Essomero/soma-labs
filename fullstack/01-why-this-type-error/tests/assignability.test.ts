import { test } from "node:test";
import assert from "node:assert/strict";
import { isAssignable, missingMembers } from "../src/assignability.ts";

test("same shape under a different name is assignable", () => {
  assert.strictEqual(
    isAssignable({ x: 1, y: 2 }, { x: "number", y: "number" }),
    true,
  );
});

test("a missing required member makes the value unassignable", () => {
  const value = { id: "u1", name: "ada" };
  assert.deepStrictEqual(missingMembers(value, { id: "string", name: "string", email: "string" }), [
    "email",
  ]);
  assert.strictEqual(isAssignable(value, { id: "string", email: "string" }), false);
});

test("a member with the wrong type makes the value unassignable", () => {
  assert.deepStrictEqual(missingMembers({ id: 1 }, { id: "string" }), ["id"]);
});

test("extra members are invisible on a variable: only what is missing is reported", () => {
  assert.strictEqual(isAssignable({ id: "u1", admin: true }, { id: "string" }), true);
});
