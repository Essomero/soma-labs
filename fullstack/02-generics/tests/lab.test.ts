import { test } from "node:test";
import assert from "node:assert/strict";
import {
  probeRelationship,
  probeConstraintAt,
  probeConstraintRequire,
  runProbe1,
  runProbe2,
  runProbe3,
  runRelationshipTour,
  runConstraintsTour,
  runFullTour,
} from "../lab.ts";

test("runProbe1 details the primitive identity relationship and compiler steps", () => {
  const result = runProbe1();
  assert.match(result, /function identity<T>/);
  assert.match(result, /Parameter "value: T" receives argument "hello"/);
  assert.match(result, /binds type parameter T := string/i);
  assert.match(result, /result\.toUpperCase\(\) is valid/);
  assert.match(result, /identityAny\("hello"\)/);
  assert.match(result, /identityUnknown\("hello"\)/);
});

test("runProbe2 details the array element type preservation", () => {
  const result = runProbe2();
  assert.match(result, /first<T>\(arr: T\[\]\)/);
  assert.match(result, /Binds T := number\[\]/);
});

test("runProbe3 details object shapes and downstream member access", () => {
  const result = runProbe3();
  assert.match(result, /result\.name exists on T/);
  assert.match(result, /result\.ghostField does NOT exist on T/);
  assert.match(result, /TS2339/);
});

test("probeConstraintAt confirms gate pass on valid key", () => {
  const result = probeConstraintAt({ id: 1, name: "Ada" }, "name");
  assert.match(result, /Entrance Gate:\s+.*PASS/);
  assert.match(result, /Internal License:\s+.*GRANTED/);
  assert.match(result, /Result value:\s+"Ada"/);
});

test("probeConstraintAt confirms gate refusal on invalid key", () => {
  const result = probeConstraintAt({ id: 1, name: "Ada" }, "salary");
  assert.match(result, /Entrance Gate:\s+.*REFUSED/);
  assert.match(result, /RangeError: key 'salary'/);
});

test("probeConstraintRequire validates entrance member requirement", () => {
  const pass = probeConstraintRequire({ id: 1, role: "admin" }, ["id", "role"]);
  assert.match(pass, /Entrance Gate:\s+.*PASS/);

  const fail = probeConstraintRequire({ id: 1 }, ["id", "role"]);
  assert.match(fail, /Entrance Gate:\s+.*REFUSED/);
});

test("guided tours run cleanly", () => {
  const rel = runRelationshipTour();
  assert.ok(rel.length > 200);
  const con = runConstraintsTour();
  assert.ok(con.length > 200);
  const full = runFullTour();
  assert.ok(full.length > 400);
});
