import { test } from "node:test";
import assert from "node:assert/strict";
import { pick } from "../src/p3_build_pick.ts";

function outcome(fn: () => unknown): string {
  try {
    return `returned keys ${JSON.stringify(Object.keys(fn() as any))}`;
  } catch (error: any) {
    return `threw ${error.message}`;
  }
}

const USER = { id: "u1", name: "ada", email: "ada@x.dev" };

test("Problem 3: picked members are copied with their values", () => {
  assert.deepStrictEqual(pick(USER, "id", "name"), { id: "u1", name: "ada" });
});

test("Problem 3: picking an empty list returns an empty object", () => {
  assert.deepStrictEqual(pick(USER), {});
});

test("Problem 3: a key the object does not have is refused, naming the key", () => {
  assert.throws(
    () => pick(USER, "nonexistent" as any),
    /unknown key: nonexistent/,
    `Expected the unknown key to be refused, but the call ${outcome(() => pick(USER, "nonexistent" as any))}.`,
  );
});
