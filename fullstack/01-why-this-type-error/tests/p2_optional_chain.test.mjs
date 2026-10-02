import { test } from "node:test";
import assert from "node:assert/strict";
import { themeFor } from "../src/p2_optional_chain.mjs";

test("Problem 2: a stored preference is returned upper-cased", () => {
  const settings = new Map([["default", { theme: "dark" }]]);
  assert.strictEqual(
    themeFor(settings, "default"),
    "DARK",
    `Expected "DARK", but got ${themeFor(settings, "default")}.`,
  );
});

test("Problem 2: a missing key falls back to the light theme instead of throwing", () => {
  const settings = new Map();
  assert.strictEqual(
    themeFor(settings, "default"),
    "LIGHT",
    `Expected the missing-key fallback "LIGHT", but the call ${(() => {
      try {
        return JSON.stringify(themeFor(settings, "default"));
      } catch (error) {
        return `threw ${error.constructor.name}`;
      }
    })()}.`,
  );
});
