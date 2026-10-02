/**
 * Constraints: the entrance requirement and the body's license.
 *
 * A constraint says which family of types a function serves. `requireMembers`
 * is the entrance requirement — a value that cannot meet it is refused with a
 * message naming the missing member. `at` is the keyed workhorse,
 * `K extends keyof T`: a key the object does not have is refused before any
 * member access happens.
 */

export function requireMembers(value, members) {
  const missing = members.filter(
    (member) =>
      value === null ||
      typeof value !== "object" ||
      !Object.prototype.hasOwnProperty.call(value, member),
  );
  if (missing.length > 0) {
    throw new TypeError(
      `does not satisfy the constraint: missing ${missing.join(", ")}`,
    );
  }
  return value;
}

export function at(object, key) {
  if (
    object === null ||
    typeof object !== "object" ||
    !Object.prototype.hasOwnProperty.call(object, key)
  ) {
    throw new RangeError(`key '${key}' is not a key of the object`);
  }
  return object[key];
}
