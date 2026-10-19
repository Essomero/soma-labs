/**
 * The mapped-type language, executable.
 *
 * A shape descriptor maps a member name to the name of the type it holds — the
 * runtime shadow of `keyof T`, `T[K]`, and `{ [K in keyof T]: ... }`.
 */

export type ShapeDescriptor = Record<string, string>;

/** `keyof T` — the union of the shape's members. */
export function keysOf(shape: ShapeDescriptor): string[] {
  return Object.keys(shape);
}

/** `T[K]` — the type stored at one member. */
export function memberOf(shape: ShapeDescriptor, key: string): string {
  return shape[key];
}

/** `{ [K in keyof T]: ... }` — rebuild a shape through a transform. */
export function mapShape(
  shape: ShapeDescriptor,
  transform: (type: string, key: string) => string,
): ShapeDescriptor {
  return Object.fromEntries(
    Object.entries(shape).map(([key, type]) => [key, transform(type, key)]),
  );
}

/** `Partial<T>` — every member becomes optional. */
export function myPartial(shape: ShapeDescriptor): ShapeDescriptor {
  return mapShape(shape, (type) => `${type} | undefined`);
}

/** `Pick<T, K>` — keep only the listed members; an unknown key is refused. */
export function myPick(shape: ShapeDescriptor, keys: string[]): ShapeDescriptor {
  const picked: ShapeDescriptor = {};
  for (const key of keys) {
    if (!(key in shape)) throw new Error(`unknown member: ${key}`);
    picked[key] = shape[key];
  }
  return picked;
}

/** `Omit<T, K>` — every member except the listed ones. */
export function myOmit(shape: ShapeDescriptor, keys: string[]): ShapeDescriptor {
  const dropped = new Set(keys);
  for (const key of keys) {
    if (!(key in shape)) throw new Error(`unknown member: ${key}`);
  }
  const kept: ShapeDescriptor = {};
  for (const key of keysOf(shape)) {
    if (!dropped.has(key)) kept[key] = shape[key];
  }
  return kept;
}

/** `Record<K, V>` — one member per key, every one holding the same type. */
export function myRecord(keys: string[], type: string): ShapeDescriptor {
  return Object.fromEntries(keys.map((key) => [key, type]));
}

/** The type a shape denotes, printed the way the mapped type would read. */
export function describeShape(shape: ShapeDescriptor): string {
  const members = Object.entries(shape).map(([key, type]) => `${key}: ${type}`);
  return members.length === 0 ? "{}" : `{ ${members.join("; ")} }`;
}
