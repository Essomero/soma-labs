import { test } from "node:test";
import assert from "node:assert/strict";
import { route } from "../src/p2_over_generalized.mjs";

const PATH = "/users/{id}/posts/{postId}";

function outcome(fn) {
  try {
    return `returned ${JSON.stringify(fn())}`;
  } catch (error) {
    return `threw ${error.message}`;
  }
}

test("Problem 2: supplied params are substituted in place", () => {
  assert.strictEqual(route("/users/{id}", { id: 42 }), "/users/42");
});

test("Problem 2: every placeholder is substituted, not just the first", () => {
  assert.strictEqual(route(PATH, { id: 42, postId: 7 }), "/users/42/posts/7");
});

test("Problem 2: a placeholder with no param is refused, naming the key", () => {
  assert.throws(
    () => route(PATH, { id: 42 }),
    /missing route param: postId/,
    `Expected a refusal naming "postId", but the call ${outcome(() => route(PATH, { id: 42 }))}.`,
  );
});
