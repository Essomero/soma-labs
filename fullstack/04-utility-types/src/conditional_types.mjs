/**
 * The conditional-type language, executable.
 *
 * `T extends U ? X : Y` is checked once per member of a union and the results
 * re-union — the distribution behavior `Exclude` and `NonNullable` depend on.
 * The descriptors below carry a `kind` so `infer` can be modelled as a
 * destructure of the pattern that matched.
 */

/** `A extends (infer E)[] ? E : never` — the array pattern to destructure. */
export const arrayOf = (element) => ({ kind: "array", element });

/** `F extends (...args: any[]) => infer R ? R : never` — the signature pattern. */
export const fnOf = (returns) => ({ kind: "function", returns });

/** `Exclude<T, U>` — distribute, drop the members U covers, re-union. */
export function myExclude(members, excluded) {
  const dropped = new Set(excluded);
  return members.filter((member) => !dropped.has(member));
}

/** `NonNullable<T>` — the same recipe with a fixed exclusion set. */
export function myNonNullable(members) {
  return members.filter((member) => member !== null && member !== undefined);
}

/** `T extends string ? true : false`, read one member at a time. */
export function isString(member) {
  return typeof member === "string";
}

/** The re-union: agreeing answers collapse to one, disagreeing ones to boolean. */
export function matchEach(members, test) {
  const answers = members.map((member) => test(member));
  return answers.every((answer) => answer === answers[0]) ? answers[0] : "boolean";
}

/** `infer` — the element bound by the array pattern, or never if it did not match. */
export function inferElement(descriptor) {
  return descriptor.kind === "array" ? descriptor.element : "never";
}

/** `infer` — the return type bound by the signature pattern, or never. */
export function inferReturn(descriptor) {
  return descriptor.kind === "function" ? descriptor.returns : "never";
}
