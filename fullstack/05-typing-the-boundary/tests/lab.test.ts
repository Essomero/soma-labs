import { test } from "node:test";
import assert from "node:assert/strict";
import {
  probeBoundaryDoors,
  runProbe1,
  runProbe2,
  runProbe3,
  runProbe4,
  runBoundaryTour,
} from "../lab.ts";

test("runProbe1 details valid untrusted payload", () => {
  const result = runProbe1();
  assert.match(result, /Door A \(as User\)/);
  assert.match(result, /Door B \(safeParse\)/);
});

test("runProbe2 details missing field crash vs schema catch", () => {
  const result = runProbe2();
  assert.match(result, /RUNTIME CRASH/);
  assert.match(result, /BOUNDARY CHECK:\s+REJECTED/);
  assert.match(result, /CRASH PREVENTED:\s+YES/);
});

test("runProbe3 details corrupted field handling", () => {
  const result = runProbe3();
  assert.match(result, /TypeError: user\.email\.toLowerCase is not a function/);
  assert.match(result, /Door B \(safeParse\): Caught at boundary/);
});

test("runProbe4 details API drift detection", () => {
  const result = runProbe4();
  assert.match(result, /Backend renamed 'email' to 'email_address'/);
  assert.match(result, /safeParse immediately fails on missing 'email'/);
});

test("probeBoundaryDoors handles programmatic calls", () => {
  const res = probeBoundaryDoors({ id: "1", name: "Ada", email: "ada@x.com", role: "admin" });
  assert.match(res, /Schema Gate:\s+PASSED/);
});

test("guided tour runs cleanly", () => {
  const tour = runBoundaryTour();
  assert.ok(tour.length > 300);
});
