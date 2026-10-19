import { test } from "node:test";
import assert from "node:assert/strict";
import {
  probeAssignability,
  probeFamily,
  runAssignabilityTour,
  runFamilyTour,
  runFullTour,
} from "../lab.mjs";

test("probeAssignability handles exact match", () => {
  const result = probeAssignability({ id: "1", name: "Ada" }, { id: "string", name: "string" });
  assert.match(result, /ASSIGNABLE \(exact shape match\)/);
});

test("probeAssignability handles missing member", () => {
  const result = probeAssignability({ id: "1" }, { id: "string", name: "string" });
  assert.match(result, /Required Member Check: FAILED/);
  assert.match(result, /REFUSED/);
});

test("probeAssignability allows extra members on variable references", () => {
  const result = probeAssignability(
    { id: "1", name: "Ada", role: "admin" },
    { id: "string", name: "string" },
    { isFresh: false },
  );
  assert.match(result, /Excess Property Check: SKIPPED/);
  assert.match(result, /ASSIGNABLE \(structural subtyping/);
});

test("probeAssignability refuses extra members on fresh literals", () => {
  const result = probeAssignability(
    { id: "1", name: "Ada", role: "admin" },
    { id: "string", name: "string" },
    { isFresh: true },
  );
  assert.match(result, /Excess Property Check: TRIGGERED/);
  assert.match(result, /TS2353/);
});

test("probeFamily classifies error messages", () => {
  const r1 = probeFamily("Type 'number' is not assignable to type 'string'.");
  assert.match(r1, /missing-or-incompatible/);

  const r2 = probeFamily("Object is possibly 'undefined'.");
  assert.match(r2, /possibly-undefined/);

  const r3 = probeFamily("Property 'radius' does not exist on type 'Shape'.");
  assert.match(r3, /union-no-common-member/);
});

test("guided tour runs cleanly", () => {
  const ass = runAssignabilityTour();
  assert.ok(ass.length > 100);
  const fam = runFamilyTour();
  assert.ok(fam.length > 100);
  const full = runFullTour();
  assert.ok(full.length > 200);
});
