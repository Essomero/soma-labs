import { test } from "node:test";
import assert from "node:assert/strict";
import {
  probeMapped,
  probeDistribution,
  probeInfer,
  runProbe1,
  runProbe2,
  runProbe3,
  runProbe4,
  runProbe5,
  runMachineryTour,
} from "../lab.mjs";

test("runProbe1 details Partial<T> mapped loop", () => {
  const result = runProbe1();
  assert.match(result, /type Partial<T> = \{ \[K in keyof T\]\?: T\[K\] \}/);
  assert.match(result, /keyof User -> \["id", "email", "role", "age"\]/);
});

test("runProbe2 details Pick<T, K> and constraint check", () => {
  const result = runProbe2();
  assert.match(result, /type Pick<T, K extends keyof T>/);
  assert.match(result, /TS2344/);
});

test("runProbe3 details Omit<T, K> inverted pick", () => {
  const result = runProbe3();
  assert.match(result, /type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>/);
});

test("runProbe4 details conditional distribution", () => {
  const result = runProbe4();
  assert.match(result, /type Exclude<T, U> = T extends U \? never : T/);
  assert.match(result, /"click" \| "scroll"/);
});

test("runProbe5 details infer pattern matching", () => {
  const result = runProbe5();
  assert.match(result, /type ElementOf<T> = T extends \(infer E\)\[\] \? E : never/);
  assert.match(result, /Promise<User>/);
});

test("guided tour runs cleanly", () => {
  const tour = runMachineryTour();
  assert.ok(tour.length > 300);
});
