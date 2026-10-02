import { test } from "node:test";
import assert from "node:assert/strict";
import {
  describeShape,
  keysOf,
  mapShape,
  memberOf,
  myOmit,
  myPartial,
  myPick,
  myRecord,
} from "../src/shape_ops.mjs";

const USER = { id: "string", name: "string", passwordHash: "string" };

test("keyof T lists the shape's members", () => {
  assert.deepStrictEqual(keysOf(USER), ["id", "name", "passwordHash"]);
});

test("indexed access T[K] reads the type stored at one member", () => {
  assert.strictEqual(memberOf(USER, "id"), "string");
});

test("the mapped loop rebuilds a shape through a transform", () => {
  const shouty = mapShape(USER, (type, key) => `${type}<${key}>`);
  assert.deepStrictEqual(shouty, {
    id: "string<id>",
    name: "string<name>",
    passwordHash: "string<passwordHash>",
  });
});

test("Partial<T> marks every member optional", () => {
  assert.deepStrictEqual(myPartial({ id: "string", name: "string" }), {
    id: "string | undefined",
    name: "string | undefined",
  });
});

test("Pick<T, K> keeps only the listed members, and refuses an unknown one", () => {
  assert.deepStrictEqual(myPick(USER, ["id", "name"]), { id: "string", name: "string" });
  assert.throws(() => myPick(USER, ["nickname"]), /unknown member: nickname/);
});

test("Omit<T, K> is Pick inverted — composing them returns the original", () => {
  const masked = myOmit(USER, ["passwordHash"]);
  assert.deepStrictEqual(masked, { id: "string", name: "string" });
  assert.deepStrictEqual(myPick(masked, ["id"]), { id: "string" });
});

test("Record<K, V> gives every key the same value type", () => {
  assert.deepStrictEqual(myRecord(["draft", "published"], "number"), {
    draft: "number",
    published: "number",
  });
});

test("a shape prints the way its mapped type reads", () => {
  assert.strictEqual(
    describeShape({ id: "string", name: "string" }),
    "{ id: string; name: string }",
  );
  assert.strictEqual(describeShape({}), "{}");
});
