import { test } from "node:test";
import assert from "node:assert/strict";
import { myOmit, myPartial, myPick } from "../src/p1_my_utilities.mjs";

const USER = { id: "string", name: "string", passwordHash: "string" };

test("Problem 1: MyPartial makes every member optional", () => {
  const draft = myPartial({ id: "string", name: "string" });
  assert.deepStrictEqual(
    draft,
    { id: "string | undefined", name: "string | undefined" },
    `Expected every member to allow undefined, but got ${JSON.stringify(draft)}.`,
  );
});

test("Problem 1: MyPick keeps only the listed members", () => {
  assert.deepStrictEqual(myPick(USER, ["id", "name"]), { id: "string", name: "string" });
});

test("Problem 1: MyOmit keeps everything except the listed members", () => {
  const masked = myOmit(USER, ["passwordHash"]);
  assert.deepStrictEqual(
    masked,
    { id: "string", name: "string" },
    `Expected the passwordHash member to be dropped from ${JSON.stringify(USER)}, but got ${JSON.stringify(masked)}.`,
  );
});
