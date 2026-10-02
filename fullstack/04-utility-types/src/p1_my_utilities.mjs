/**
 * The three utilities this codebase leans on most, written out by hand: a form
 * draft is `MyPartial`, a card view model is `MyPick`, and an API mask is
 * `MyOmit`. A shape descriptor maps a member name to the name of its type.
 */

/** `Partial<T>` — the draft state, where any member may still be unset. */
export function myPartial(shape) {
  const draft = {};
  for (const [key, type] of Object.entries(shape)) {
    draft[key] = type;
  }
  return draft;
}

/** `Pick<T, K>` — keep only the listed members. */
export function myPick(shape, keys) {
  const picked = {};
  for (const key of keys) {
    picked[key] = shape[key];
  }
  return picked;
}

/** `Omit<T, K>` — everything except the listed members. */
export function myOmit(shape, keys) {
  const omitted = {};
  for (const key of keys) {
    omitted[key] = shape[key];
  }
  return omitted;
}
