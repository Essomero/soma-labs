import { test } from "node:test";
import assert from "node:assert/strict";
import {
  probeShape,
  probeState,
  runProbe1,
  runProbe2,
  runProbe3,
  runProbe4,
  runProbe5,
  runProbe6,
  runDispatcherTour,
  runAsyncStateTour,
  runFullTour,
} from "../lab.ts";

test("runProbe1 details circle dispatch", () => {
  const result = runProbe1();
  assert.match(result, /type Shape = Circle \| Square \| Rect/);
  assert.match(result, /78\.54/);
});

test("runProbe4 details assertNever exhaustiveness", () => {
  const result = runProbe4();
  assert.match(result, /assertNever\(value: never\)/);
  assert.match(result, /COMPILER RED SQUIGGLE/);
});

test("runProbe5 details async state union exclusivity", () => {
  const result = runProbe5();
  assert.match(result, /type AsyncState<T> = Idle \| Loading \| Success<T> \| Error/);
});

test("runProbe6 details the destructuring trap", () => {
  const result = runProbe6();
  assert.match(result, /DESTRUCTURING TRAP/);
  assert.match(result, /The Senior Fix/);
});

test("probeShape and probeState programmatic tests", () => {
  const s = probeShape({ kind: "square", side: 4 });
  assert.match(s, /Narrowed to Square/);

  const a = probeState({ status: "loading" });
  assert.match(a, /kind":"spinner/);
});

test("guided tours run cleanly", () => {
  const d = runDispatcherTour();
  assert.ok(d.length > 200);
  const s = runAsyncStateTour();
  assert.ok(s.length > 200);
  const f = runFullTour();
  assert.ok(f.length > 400);
});
