import { test } from "node:test";
import assert from "node:assert/strict";
import { probeBoundaryDoors, runBoundaryTour } from "../lab.mjs";

test("probeBoundaryDoors handles valid payload", () => {
  const result = probeBoundaryDoors({
    id: "u1",
    name: "Ada",
    email: "ada@test.com",
    role: "admin",
  });
  assert.match(result, /Schema Gate:\s+PASSED/);
  assert.match(result, /Execution Status: SUCCESS/);
});

test("probeBoundaryDoors catches crash in Door A and catches schema rejection in Door B", () => {
  const result = probeBoundaryDoors({ id: "u1", name: "Ada", role: "admin" });
  assert.match(result, /RUNTIME CRASH/);
  assert.match(result, /Schema Gate:\s+REJECTED AT THE BOUNDARY/);
  assert.match(result, /Crash Prevented:\s+YES/);
});

test("guided tour runs cleanly", () => {
  const tour = runBoundaryTour();
  assert.ok(tour.length > 200);
});
