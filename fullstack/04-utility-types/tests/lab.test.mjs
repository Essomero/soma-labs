import { test } from "node:test";
import assert from "node:assert/strict";
import { probeMapped, probeDistribution, probeInfer, runMachineryTour } from "../lab.mjs";

test("probeMapped handles partial", () => {
  const result = probeMapped({ id: "string" }, "partial");
  assert.match(result, /id\?: string/);
});

test("probeMapped handles pick constraint check", () => {
  const pass = probeMapped({ id: "string", name: "string" }, "pick", ["id"]);
  assert.match(pass, /VALID/);

  const fail = probeMapped({ id: "string" }, "pick", ["salary"]);
  assert.match(fail, /Constraint Check: FAILED/);
});

test("probeDistribution illustrates distributive conditionals", () => {
  const result = probeDistribution(["a", "b", "c"], ["b"]);
  assert.match(result, /Step 1 — Distribution/);
  assert.match(result, /"b" extends "b" \? never : "b"\s+==>\s+never/);
  assert.match(result, /Result: "a" \| "c"/);
});

test("probeInfer extracts types", () => {
  const arr = probeInfer("string[]");
  assert.match(arr, /Extracted Element Type E: string/);

  const fn = probeInfer("() => number");
  assert.match(fn, /Extracted Return Type R: number/);
});

test("guided tour runs cleanly", () => {
  const tour = runMachineryTour();
  assert.ok(tour.length > 200);
});
