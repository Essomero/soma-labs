/**
 * Validate a freshly built payload against the shape it claims to satisfy.
 * A fresh literal is an exact claim, so a member the shape does not declare is
 * a mistake — a misspelled key or a field left over from a refactor.
 */
import { missingMembers } from "./assignability.ts";

export interface ValidationResult {
  ok: boolean;
  reason: string | null;
}

export function validateFresh(value: unknown, shape: Record<string, string>): ValidationResult {
  const missing = missingMembers(value, shape);
  if (missing.length > 0) {
    return { ok: false, reason: `missing:${missing.join(",")}` };
  }
  return { ok: true, reason: null };
}
