/**
 * The assignability rule, executable.
 *
 * A value is assignable to a shape when every member the shape requires is
 * present on the value with a compatible type. Extra members are invisible on a
 * variable — which is why checking a variable reports what is *missing*, never
 * what is *extra*.
 */

export type PrimitiveKind = "string" | "number" | "boolean" | "object";

const KINDS: Record<PrimitiveKind, (v: unknown) => boolean> = {
  string: (v) => typeof v === "string",
  number: (v) => typeof v === "number",
  boolean: (v) => typeof v === "boolean",
  object: (v) => typeof v === "object" && v !== null,
};

export function memberMatches(value: unknown, kind: string): boolean {
  const test = KINDS[kind as PrimitiveKind];
  if (!test) throw new Error(`unknown member kind: ${kind}`);
  return test(value);
}

/** The members the shape requires that the value does not satisfy. */
export function missingMembers(value: unknown, shape: Record<string, string>): string[] {
  if (value === null || typeof value !== "object") {
    return Object.keys(shape);
  }
  const obj = value as Record<string, unknown>;
  return Object.entries(shape)
    .filter(
      ([key, kind]) =>
        !Object.prototype.hasOwnProperty.call(obj, key) ||
        !memberMatches(obj[key], kind),
    )
    .map(([key]) => key);
}

export function isAssignable(value: unknown, shape: Record<string, string>): boolean {
  return missingMembers(value, shape).length === 0;
}
