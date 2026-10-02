import { test } from "node:test";
import assert from "node:assert/strict";
import { pick } from "../src/p3_build_pick.mjs";

const USER = { id: "u1", name: "ada", email: "ada@x.dev" };

function outcome(fn) {
  try {
    return `returned keys ${JSON.stringify(Object.keys(fn()))}`;
  } catch (error) {
    return `threw ${error.message}`;
  }
}

test("Problem 3: only the requested keys are returned", () => {
  assert.deepStrictEqual(pick(USER, "id", "name"), { id: "u1", name: "ada" });
});

test("Problem 3: the source object is not mutated", () => {
  pick(USER, "id");
  assert.deepStrictEqual(USER, { id: "u1", name: "ada", email: "ada@x.dev" });
});

test("Problem 3: a key the object does not have is refused, naming the key", () => {
  assert.throws(
    () => pick(USER, "nonexistent"),
    /unknown key: nonexistent/,
    `Expected the unknown key to be refused, but the call ${outcome(() => pick(USER, "nonexistent"))}.`,
  );
});
