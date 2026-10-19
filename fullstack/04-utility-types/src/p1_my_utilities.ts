/**
 * The three utilities this codebase leans on most, written out by hand: a form
 * draft is `MyPartial`, a card view model is `MyPick`, and an API mask is
 * `MyOmit`. A shape descriptor maps a member name to the name of its type.
 */

export type Shape = Record<string, string>;

/** `Partial<T>` — the draft state, where any member may still be unset. */
export function myPartial(shape: Shape): Shape {
  const draft: Shape = {};
  for (const [key, type] of Object.entries(shape)) {
    draft[key] = type;
  }
  return draft;
}

/** `Pick<T, K>` — keep only the listed members. */
export function myPick(shape: Shape, keys: string[]): Shape {
  const picked: Shape = {};
  for (const key of keys) {
    picked[key] = shape[key];
  }
  return picked;
}

/** `Omit<T, K>` — everything except the listed members. */
export function myOmit(shape: Shape, keys: string[]): Shape {
  const omitted: Shape = {};
  for (const key of keys) {
    omitted[key] = shape[key];
  }
  return omitted;
}
