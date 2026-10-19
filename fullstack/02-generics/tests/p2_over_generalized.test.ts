import { test } from "node:test";
import assert from "node:assert/strict";
import { route } from "../src/p2_over_generalized.ts";

function outcome(fn: () => unknown): string {
  try {
    return `returned ${JSON.stringify(fn())}`;
  } catch (error: any) {
    return `threw ${error.message}`;
  }
}

test("Problem 2: placeholders are substituted from params", () => {
  assert.strictEqual(
    route("/users/{id}/posts/{slug}", { id: "42", slug: "hello" }),
    "/users/42/posts/hello",
  );
});

test("Problem 2: numbers are stringified", () => {
  assert.strictEqual(route("/items/{id}", { id: 7 as any }), "/items/7");
});

test("Problem 2: a placeholder with no param is refused, naming the key", () => {
  assert.throws(
    () => route("/users/{id}/posts/{postId}", { id: "42" } as any),
    /missing route param: postId/,
    `Expected a refusal naming "postId", but the call ${outcome(() => route("/users/{id}/posts/{postId}", { id: "42" } as any))}.`,
  );
});
