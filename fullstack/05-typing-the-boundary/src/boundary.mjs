/**
 * The two doors untrusted data comes through: a JSON text and an already-parsed
 * value. Neither door returns `any` — both hand back a result the caller has to
 * check, because the type system cannot see what is behind the door.
 */

import { ParseError, parse } from "./schema.mjs";

/** `JSON.parse` hands back `unknown`; a malformed text is data, not an exception to leak. */
export function readJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

/** Parse-don't-validate: a schema in, a guaranteed value or a named failure out. */
export function decode(schema, input) {
  try {
    return { ok: true, data: parse(schema, input) };
  } catch (error) {
    if (error instanceof ParseError) {
      return { ok: false, message: error.message, path: error.path };
    }
    throw error;
  }
}
