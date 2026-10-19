import { test } from "node:test";
import assert from "node:assert/strict";
import {
  probeAssignability,
  probeFamily,
  runProbe1,
  runProbe2,
  runProbe3,
  runProbe4,
  runProbe5,
  runAssignabilityTour,
  runFamilyTour,
  runFullTour,
} from "../lab.ts";

test("runProbe1 details exact shape match", () => {
  const result = runProbe1();
  assert.match(result, /function isAssignable/);
  assert.match(result, /ASSIGNABLE \(Exact match satisfies shape contract\)/);
});

test("runProbe2 details missing member refusal", () => {
  const result = runProbe2();
  assert.match(result, /TS2322/);
  assert.match(result, /REFUSED/);
});

test("runProbe3 details variable reference structural subtyping", () => {
  const result = runProbe3();
  assert.match(result, /Variables are checked for what is MISSING/);
  assert.match(result, /ASSIGNABLE \(Structural subtyping/);
});

test("runProbe4 details fresh literal excess property check", () => {
  const result = runProbe4();
  assert.match(result, /Fresh literals trigger the Excess Property Check/);
  assert.match(result, /TS2353/);
  assert.match(result, /REFUSED/);
});

test("runProbe5 details diagnostic error families", () => {
  const result = runProbe5();
  assert.match(result, /missing-or-incompatible/);
  assert.match(result, /excess-property/);
  assert.match(result, /possibly-undefined/);
  assert.match(result, /union-no-common-member/);
});

test("probeAssignability handles programmatic calls", () => {
  const r1 = probeAssignability({ id: "1", name: "Ada" }, { id: "string", name: "string" });
  assert.match(r1, /ASSIGNABLE/);
});

test("guided tours run cleanly", () => {
  const ass = runAssignabilityTour();
  assert.ok(ass.length > 200);
  const fam = runFamilyTour();
  assert.ok(fam.length > 100);
  const full = runFullTour();
  assert.ok(full.length > 300);
});
