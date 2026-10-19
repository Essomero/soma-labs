import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchProfile } from "../src/p1_boundary_audit.ts";

const VALID = { id: "u1", name: "ada", email: "ada@example.com", role: "admin" };

const clientReturning = (status: number, body: unknown) => ({
  get: async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }),
});

test("Problem 1: a 200 with a valid body yields the profile", async () => {
  const profile = await fetchProfile(clientReturning(200, VALID), "u1");
  assert.deepStrictEqual(profile, VALID);
});

test("Problem 1: an error response is rejected with the API's message", async () => {
  const client = clientReturning(404, { error: { message: "user not found" } });
  await assert.rejects(
    fetchProfile(client, "u9"),
    /user not found/,
    "Expected a 404 to be rejected with the API's message, but the error envelope was returned as a profile.",
  );
});

test("Problem 1: a 200 whose body is missing a member is rejected, naming it", async () => {
  const client = clientReturning(200, { id: "u1", name: "ada", role: "member" });
  await assert.rejects(
    fetchProfile(client, "u1"),
    /email/,
    "Expected a body without email to be rejected by the schema, but it was returned as a profile.",
  );
});
