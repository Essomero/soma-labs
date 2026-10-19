import { test } from "node:test";
import assert from "node:assert/strict";
import { assignabilityTable, checkAssignable } from "../src/p2_assignability.ts";

test("Problem 2: any flows out into any type", () => {
  assert.deepStrictEqual(checkAssignable("any", "string"), { assignable: true, reason: null });
});

test("Problem 2: every type flows into any and into unknown", () => {
  const intoAny = checkAssignable("string", "any");
  assert.strictEqual(
    intoAny.assignable,
    true,
    `Expected string -> any to be assignable, but the table reports ${JSON.stringify(intoAny)}.`,
  );
  assert.strictEqual(checkAssignable("string", "unknown").assignable, true);
  assert.strictEqual(checkAssignable("unknown", "any").assignable, true);
});

test("Problem 2: unknown yields nothing without proof", () => {
  const cell = checkAssignable("unknown", "string");
  assert.strictEqual(
    cell.assignable,
    false,
    `Expected unknown -> string to be unassignable, but the table reports it as assignable.`,
  );
  assert.match(cell.reason as string, /narrow/);
});

test("Problem 2: the only failing cell is unknown to a narrower type", () => {
  const failing = assignabilityTable()
    .filter((cell) => !cell.assignable)
    .map((cell) => `${cell.from} -> ${cell.to}`);
  assert.deepStrictEqual(
    failing,
    ["unknown -> string"],
    `Expected the table's only failing cell to be "unknown -> string", but it reports ${JSON.stringify(failing)}.`,
  );
});
