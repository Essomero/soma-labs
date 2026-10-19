/**
 * The conditional-type language, executable.
 *
 * `T extends U ? X : Y` is checked once per member of a union and the results
 * re-union — the distribution behavior `Exclude` and `NonNullable` depend on.
 * The descriptors below carry a `kind` so `infer` can be modelled as a
 * destructure of the pattern that matched.
 */

export type ArrayDescriptor = { kind: "array"; element: string };
export type FunctionDescriptor = { kind: "function"; returns: string };
export type TypeDescriptor = ArrayDescriptor | FunctionDescriptor | { kind: "other" };

/** `A extends (infer E)[] ? E : never` — the array pattern to destructure. */
export const arrayOf = (element: string): ArrayDescriptor => ({ kind: "array", element });

/** `F extends (...args: any[]) => infer R ? R : never` — the signature pattern. */
export const fnOf = (returns: string): FunctionDescriptor => ({ kind: "function", returns });

/** `Exclude<T, U>` — distribute, drop the members U covers, re-union. */
export function myExclude<T extends string>(members: T[], excluded: string[]): T[] {
  const dropped = new Set(excluded);
  return members.filter((member) => !dropped.has(member));
}

/** `NonNullable<T>` — the same recipe with a fixed exclusion set. */
export function myNonNullable<T>(members: T[]): T[] {
  return members.filter((member) => member !== null && member !== undefined);
}

/** `T extends string ? true : false`, read one member at a time. */
export function isString(member: unknown): boolean {
  return typeof member === "string";
}

/** The re-union: agreeing answers collapse to one, disagreeing ones to boolean. */
export function matchEach(members: unknown[], test: (m: unknown) => boolean): boolean | string {
  const answers = members.map((member) => test(member));
  return answers.every((answer) => answer === answers[0]) ? answers[0] : "boolean";
}

/** `infer` — the element bound by the array pattern, or never if it did not match. */
export function inferElement(descriptor: TypeDescriptor): string {
  return descriptor.kind === "array" ? descriptor.element : "never";
}

/** `infer` — the return type bound by the signature pattern, or never. */
export function inferReturn(descriptor: TypeDescriptor): string {
  return descriptor.kind === "function" ? descriptor.returns : "never";
}
