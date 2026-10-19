import { test } from "node:test";
import assert from "node:assert/strict";
import { at, requireMembers } from "../src/constraints.ts";

test("a value that satisfies the constraint passes through unchanged", () => {
  const value = { id: "u1", name: "ada" };
  assert.deepStrictEqual(requireMembers(value, ["id"]), value);
});

test("the constraint is the entrance requirement: the missing member is named", () => {
  assert.throws(
    () => requireMembers({ name: "ada" }, ["id"]),
    /does not satisfy the constraint: missing id/,
  );
});

test("the keyed constraint licenses member access", () => {
  const user = { id: "u1", name: "ada" };
  assert.strictEqual(at(user, "name"), "ada");
  assert.strictEqual(at(user, "id"), "u1");
});

test("a key the object does not have is refused before access", () => {
  assert.throws(
    () => at({ id: "u1" } as any, "name" as any),
    /key 'name' is not a key of the object/,
  );
});
