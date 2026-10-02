/**
 * CI gate for the shared contract. `userSchema` is the contract; the client's
 * hand-written model lists the fields it still knows about. The gate reports
 * the fields the client model is missing, so drift is caught by the pipeline
 * instead of by a production crash.
 */

import { userSchema } from "./schema.mjs";

export function contractFields() {
  return Object.keys(userSchema.shape);
}

export function drift(clientFields) {
  const contract = contractFields();
  const missing = clientFields.filter((field) => !contract.includes(field));
  return { inSync: missing.length === 0, missing };
}
