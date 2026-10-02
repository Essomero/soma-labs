import { test } from "node:test";
import assert from "node:assert/strict";
import { decode, readJson } from "../src/boundary.mjs";
import { number, object, userSchema } from "../src/schema.mjs";

const RAW = { id: "u1", name: "ada", email: "ada@example.com", role: "member" };

test("readJson hands back the parsed value as an unknown", () => {
  assert.deepStrictEqual(readJson('{"id":"u1"}'), { ok: true, value: { id: "u1" } });
});

test("readJson turns malformed text into a result instead of an exception", () => {
  const result = readJson("{ not json");
  assert.strictEqual(result.ok, false);
  assert.strictEqual(typeof result.message, "string");
});

test("decode parses untrusted input into the shape the schema guarantees", () => {
  const result = decode(userSchema, { ...RAW, admin: true });
  assert.deepStrictEqual(result, { ok: true, data: RAW });
});

test("decode reports the failing path without throwing", () => {
  const result = decode(object({ count: number() }), { count: "two" });
  assert.strictEqual(result.ok, false);
  assert.deepStrictEqual(result.path, ["count"]);
  assert.match(result.message, /count: expected number/);
});
