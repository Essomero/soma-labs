import { test } from "node:test";
import assert from "node:assert/strict";
import { describe } from "../src/p2_trap_hunt.ts";

function outcome(fn: () => unknown): string {
  try {
    return `returned ${JSON.stringify(fn())}`;
  } catch (error: any) {
    return `threw ${error.message}`;
  }
}

test("Problem 2: a text document describes its body", () => {
  assert.strictEqual(describe({ type: "text", body: "hello" }), "hello");
});

test("Problem 2: an image with alt text includes the alt", () => {
  const result = describe({ type: "image", url: "a.png", alt: "a cat" });
  assert.strictEqual(
    result,
    "a.png (a cat)",
    `Expected "a.png (a cat)", but got ${JSON.stringify(result)}.`,
  );
});

test("Problem 2: an image without alt omits the suffix instead of printing undefined", () => {
  const result = describe({ type: "image", url: "a.png" });
  assert.strictEqual(
    result,
    "a.png",
    `Expected "a.png" when alt is absent, but got ${JSON.stringify(result)}.`,
  );
});

test("Problem 2: a document type outside the union is unreachable, not echoed back", () => {
  const video = { type: "video", src: "v.mp4" } as any;
  assert.throws(
    () => describe(video),
    /unhandled case/,
    `Expected an unknown document type to be refused as unreachable, but the call ${outcome(() => describe(video))}.`,
  );
});
