import { test } from "node:test";
import assert from "node:assert/strict";
import {
  probeShape,
  probeState,
  runDispatcherTour,
  runAsyncStateTour,
  runFullTour,
} from "../lab.mjs";

test("probeShape handles known circle variant", () => {
  const result = probeShape({ kind: "circle", radius: 5 });
  assert.match(result, /Eliminated \[Square, Rect\]/);
  assert.match(result, /Computed Area:\s+78\.54/);
  assert.match(result, /Exhaustiveness:\s+HANDLED/);
});

test("probeShape catches unhandled variant via assertNever", () => {
  const result = probeShape({ kind: "triangle", base: 10, height: 5 });
  assert.match(result, /TRIGGERED assertNever/);
  assert.match(result, /BLOCKED/);
});

test("probeState handles async success", () => {
  const result = probeState({ status: "success", data: "ok" });
  assert.match(result, /PASSED \(data and error never coexist\)/);
});

test("probeState explains the destructuring trap", () => {
  const result = probeState({ status: "success", data: "ok" }, { destructured: true });
  assert.match(result, /DESTRUCTURING TRAP/);
  assert.match(result, /Keep the object intact and narrow on property/);
});

test("guided tour runs cleanly", () => {
  const d = runDispatcherTour();
  assert.ok(d.length > 100);
  const s = runAsyncStateTour();
  assert.ok(s.length > 100);
  const f = runFullTour();
  assert.ok(f.length > 200);
});
