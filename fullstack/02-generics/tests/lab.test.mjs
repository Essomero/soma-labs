import { test } from "node:test";
import assert from "node:assert/strict";
import {
  probeRelationship,
  probeConstraintAt,
  probeConstraintRequire,
  runRelationshipTour,
  runConstraintsTour,
  runFullTour,
} from "../lab.mjs";

test("probeRelationship shows relationship preservation vs erasure", () => {
  const result = probeRelationship("test-str");
  assert.match(result, /Inferred T:\s+string/);
  assert.match(result, /generic <T>\(x: T\): T\s+-> return tag: string/);
  assert.match(result, /any \(x: any\): any\s+-> return tag: any/);
  assert.match(result, /unknown \(x: unk\): unk\s+-> return tag: unknown/);
});

test("probeConstraintAt confirms gate pass on valid key", () => {
  const result = probeConstraintAt({ id: 1, name: "Ada" }, "name");
  assert.match(result, /Entrance Gate:\s+PASS/);
  assert.match(result, /Internal License:\s+GRANTED/);
  assert.match(result, /Result:\s+"Ada"/);
});

test("probeConstraintAt confirms gate refusal on invalid key", () => {
  const result = probeConstraintAt({ id: 1, name: "Ada" }, "salary");
  assert.match(result, /Entrance Gate:\s+REFUSED/);
  assert.match(result, /Blocked before access/);
});

test("probeConstraintRequire validates entrance member requirement", () => {
  const pass = probeConstraintRequire({ id: 1, role: "admin" }, ["id", "role"]);
  assert.match(pass, /Entrance Gate:\s+PASS/);

  const fail = probeConstraintRequire({ id: 1 }, ["id", "role"]);
  assert.match(fail, /Entrance Gate:\s+REFUSED/);
});

test("guided tour runs without errors", () => {
  const rel = runRelationshipTour();
  assert.ok(rel.length > 100);
  const con = runConstraintsTour();
  assert.ok(con.length > 100);
  const full = runFullTour();
  assert.ok(full.length > 200);
});
