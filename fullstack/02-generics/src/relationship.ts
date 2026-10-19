/**
 * The identity relationship, executable.
 *
 * Every generic is a sentence about how one type moves with another; the
 * canonical one is `<T>(x: T): T` — for every call, the return type is exactly
 * the argument type. The wrappers below show what the alternatives fail to
 * express: `any` erases the type, `unknown` refuses to commit to it.
 */

export function tagOf(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    return value.length === 0 ? "array<empty>" : `array<${tagOf(value[0])}>`;
  }
  return typeof value;
}

/** The relationship: the tag that goes in is the tag that comes out. */
export function identity<T>(value: T): { tag: string; value: T } {
  return { tag: tagOf(value), value };
}

/** `any` erases the type: every caller gets an untyped result back. */
export function identityAny(value: any): { tag: string; value: any } {
  return { tag: "any", value };
}

/** `unknown` refuses to commit: every caller must re-state the type. */
export function identityUnknown(value: unknown): { tag: string; value: unknown } {
  return { tag: "unknown", value };
}
