/**
 * Return a new object holding only the requested keys of the source.
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const key of keys) out[key] = obj[key];
  return out;
}
