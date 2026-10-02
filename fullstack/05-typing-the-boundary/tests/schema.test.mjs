import { test } from "node:test";
import assert from "node:assert/strict";
import {
  array,
  describe,
  number,
  object,
  optional,
  parse,
  safeParse,
  string,
  transform,
  userSchema,
} from "../src/schema.mjs";

const RAW = { id: "u1", name: "ada", email: "ada@example.com", role: "admin" };

test("parse returns a value made only of the members the schema declares", () => {
  assert.deepStrictEqual(parse(userSchema, { ...RAW, admin: true }), RAW);
});

test("parse names the member that failed, with its path", () => {
  assert.throws(
    () => parse(userSchema, { ...RAW, email: 42 }),
    /email: expected string/,
  );
});

test("a wrong enum member fails at the member's path", () => {
  assert.throws(() => parse(userSchema, { ...RAW, role: "owner" }), /role: expected one of/);
});

test("safeParse reports the failure instead of throwing", () => {
  const result = safeParse(userSchema, { ...RAW, role: "owner" });
  assert.strictEqual(result.success, false);
  assert.deepStrictEqual(result.error.path, ["role"]);
});

test("safeParse succeeds with the parsed data", () => {
  assert.deepStrictEqual(safeParse(userSchema, RAW), { success: true, data: RAW });
});

test("a non-object root fails at the root, not at a member", () => {
  assert.throws(() => parse(userSchema, null), /\(root\): expected object/);
});

test("an optional member may be absent", () => {
  const signup = object({ id: string(), nickname: optional(string()) });
  assert.deepStrictEqual(parse(signup, { id: "u1" }), { id: "u1", nickname: undefined });
  assert.deepStrictEqual(parse(signup, { id: "u1", nickname: "ada" }), {
    id: "u1",
    nickname: "ada",
  });
});

test("an array schema checks every element with its path", () => {
  const scores = array(number());
  assert.deepStrictEqual(parse(scores, [1, 2]), [1, 2]);
  assert.throws(() => parse(scores, [1, "two"]), /1: expected number/);
});

test("transform shapes the value while it parses", () => {
  const isoTimestamp = transform(string(), (text) => new Date(text), "Date");
  const parsed = parse(isoTimestamp, "2026-08-16T00:00:00.000Z");
  assert.ok(parsed instanceof Date);
  assert.strictEqual(parsed.toISOString(), "2026-08-16T00:00:00.000Z");
});

test("describe prints the type the schema stands for", () => {
  assert.strictEqual(
    describe(userSchema),
    '{ id: string; name: string; email: string; role: "admin" | "member" }',
  );
});
