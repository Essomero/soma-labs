import { test } from "node:test";
import assert from "node:assert/strict";
import { at, requireMembers } from "../src/constraints.mjs";

test("a value that satisfies the constraint passes through unchanged", () => {
  const user = { id: "u1", name: "ada" };
  assert.strictEqual(requireMembers(user, ["id"]), user);
});

test("the constraint is the entrance requirement: the missing member is named", () => {
  assert.throws(
    () => requireMembers({ name: "ada" }, ["id", "email"]),
    /missing id, email/,
  );
});

test("the keyed constraint licenses member access", () => {
  const user = { id: "u1", email: "ada@x.dev" };
  assert.strictEqual(at(user, "email"), "ada@x.dev");
});

test("a key the object does not have is refused before access", () => {
  assert.throws(() => at({ id: "u1" }, "nope"), /key 'nope' is not a key/);
});
