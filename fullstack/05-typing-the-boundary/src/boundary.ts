/**
 * The two doors untrusted data comes through: a JSON text and an already-parsed
 * value. Neither door returns `any` — both hand back a result the caller has to
 * check, because the type system cannot see what is behind the door.
 */

import { ParseError, parse, type Schema } from "./schema.ts";

export type ReadJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; message: string };

export function readJson(text: string): ReadJsonResult {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error: any) {
    return { ok: false, message: error.message };
  }
}

export type DecodeResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; path: (string | number)[] };

export function decode<T>(schema: Schema<T>, input: unknown): DecodeResult<T> {
  try {
    return { ok: true, data: parse(schema, input) };
  } catch (error) {
    if (error instanceof ParseError) {
      return { ok: false, message: error.message, path: error.path };
    }
    throw error;
  }
}
