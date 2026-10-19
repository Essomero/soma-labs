import { test } from "node:test";
import assert from "node:assert/strict";
import { contractFields, drift } from "../src/p3_drift_gate.ts";

test("Problem 3: the contract exposes every field the schema declares", () => {
  assert.deepStrictEqual(contractFields(), ["id", "name", "email", "role"]);
});

test("Problem 3: a client model that has kept up with the contract is in sync", () => {
  assert.deepStrictEqual(drift(["id", "name", "email", "role"]), { inSync: true, missing: [] });
});

test("Problem 3: a field the contract added is reported as missing from the client", () => {
  const report = drift(["id", "name", "email"]);
  assert.deepStrictEqual(
    report,
    { inSync: false, missing: ["role"] },
    `Expected the gate to report "role" as missing from the client model, but it reported ${JSON.stringify(report)}.`,
  );
});

test("Problem 3: a stale client field the contract never declared is not missing", () => {
  const report = drift(["id", "name", "email", "role", "nickname"]);
  assert.deepStrictEqual(
    report,
    { inSync: true, missing: [] },
    `Expected the gate to look only for contract fields the client lacks, but it reported ${JSON.stringify(report)}.`,
  );
});
