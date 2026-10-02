/**
 * The assignability rule, executable.
 *
 * A value is assignable to a shape when every member the shape requires is
 * present on the value with a compatible type. Extra members are invisible on a
 * variable — which is why checking a variable reports what is *missing*, never
 * what is *extra*.
 */

const KINDS = {
  string: (v) => typeof v === "string",
  number: (v) => typeof v === "number",
  boolean: (v) => typeof v === "boolean",
  object: (v) => typeof v === "object" && v !== null,
};

export function memberMatches(value, kind) {
  const test = KINDS[kind];
  if (!test) throw new Error(`unknown member kind: ${kind}`);
  return test(value);
}

/** The members the shape requires that the value does not satisfy. */
export function missingMembers(value, shape) {
  if (value === null || typeof value !== "object") {
    return Object.keys(shape);
  }
  return Object.entries(shape)
    .filter(
      ([key, kind]) =>
        !Object.prototype.hasOwnProperty.call(value, key) ||
        !memberMatches(value[key], kind),
    )
    .map(([key]) => key);
}

export function isAssignable(value, shape) {
  return missingMembers(value, shape).length === 0;
}
