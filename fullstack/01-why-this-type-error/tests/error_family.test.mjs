import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyError } from "../src/error_family.mjs";

test("TS2322 reads as missing-or-incompatible", () => {
  assert.strictEqual(
    classifyError("Type 'number' is not assignable to type 'string'."),
    "missing-or-incompatible",
  );
});

test("the excess property check reads as excess-property before anything else", () => {
  assert.strictEqual(
    classifyError(
      "Object literal may only specify known properties, and 'owner' does not exist in type 'Account'.",
    ),
    "excess-property",
  );
});

test("TS2532 reads as possibly-undefined", () => {
  assert.strictEqual(classifyError("'first' is possibly 'undefined'."), "possibly-undefined");
});

test("accessing a member that is not on every union member reads as union-no-common-member", () => {
  assert.strictEqual(
    classifyError("Property 'radius' does not exist on type 'Shape'."),
    "union-no-common-member",
  );
});
