/**
 * Return a new object holding only the requested keys of the source.
 */
export function pick(obj, ...keys) {
  const out = {};
  for (const key of keys) out[key] = obj[key];
  return out;
}
