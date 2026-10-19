import { test } from "node:test";
import assert from "node:assert/strict";
import {
  identity,
  identityAny,
  identityUnknown,
  tagOf,
} from "../src/relationship.ts";

test("identity returns the argument's own type: the relationship is preserved", () => {
  assert.deepStrictEqual(identity("hello"), { tag: "string", value: "hello" });
  assert.strictEqual(identity(42).tag, "number");
  assert.strictEqual(identity(true).tag, "boolean");
});

test("identity carries the element type of an array, not just 'array'", () => {
  assert.strictEqual(identity(["a", "b"]).tag, "array<string>");
  assert.strictEqual(identity([1, 2, 3]).tag, "array<number>");
});

test("any erases the type: the caller cannot recover what went in", () => {
  assert.strictEqual(identityAny("hello").tag, "any");
  assert.deepStrictEqual(identityAny({ id: "u1" }).value, { id: "u1" });
});

test("unknown refuses to commit to the type", () => {
  assert.strictEqual(identityUnknown("hello").tag, "unknown");
});

test("tagOf names the primitive it sees", () => {
  assert.strictEqual(tagOf(null), "null");
  assert.strictEqual(tagOf("x"), "string");
});
