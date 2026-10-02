/**
 * Address nested form state by string path.
 *
 * A path labels a value that is not itself a plain object — nested objects are
 * walked so their leaves can be addressed directly, and an object with no
 * members is a leaf of its own. Paths join with ".".
 */

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function deepKeys(value, prefix = "") {
  const paths = [];
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(child) && Object.keys(child).length > 0) {
      paths.push(...deepKeys(child));
      continue;
    }
    paths.push(path);
  }
  return paths;
}
