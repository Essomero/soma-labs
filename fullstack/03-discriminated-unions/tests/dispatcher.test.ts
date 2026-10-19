import { test } from "node:test";
import assert from "node:assert/strict";
import { area, assertNever } from "../src/dispatcher.ts";

test("each member of the union is computed by its own branch", () => {
  assert.strictEqual(area({ kind: "circle", radius: 1 }), 3.14);
  assert.strictEqual(area({ kind: "square", side: 3 }), 9);
  assert.strictEqual(area({ kind: "rect", width: 4, height: 5 }), 20);
});

test("a kind outside the union is unreachable: the exhaustive branch throws", () => {
  assert.throws(() => area({ kind: "triangle", base: 2, height: 3 } as any), /unhandled case/);
});

test("assertNever reports the value it was handed", () => {
  assert.throws(() => assertNever({ kind: "hexagon" } as never), /unhandled case: \{"kind":"hexagon"\}/);
});
