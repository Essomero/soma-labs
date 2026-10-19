/**
 * A miniature zod.
 *
 * One schema describes a shape twice: as the runtime check and as the type the
 * check guarantees. `parse` is the only door from untrusted data to trusted
 * data, `safeParse` is the non-throwing variant, and `describe` prints the type
 * the schema stands for: the runtime shadow of `z.infer<typeof schema>`.
 */

export class ParseError extends Error {
  path: (string | number)[];
  constructor(path: (string | number)[], message: string) {
    const where = path.length > 0 ? path.join(".") : "(root)";
    super(`${where}: ${message}`);
    this.name = "ParseError";
    this.path = path;
  }
}

function fail(path: (string | number)[], message: string): never {
  throw new ParseError(path, message);
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export interface Schema<T> {
  kind: string;
  parse(value: unknown, path?: (string | number)[]): T;
  [key: string]: unknown;
}

export const string = (): Schema<string> => ({
  kind: "string",
  parse(value, path = []) {
    if (typeof value !== "string") fail(path, "expected string");
    return value;
  },
});

export const number = (): Schema<number> => ({
  kind: "number",
  parse(value, path = []) {
    if (typeof value !== "number" || Number.isNaN(value)) fail(path, "expected number");
    return value;
  },
});

export const boolean = (): Schema<boolean> => ({
  kind: "boolean",
  parse(value, path = []) {
    if (typeof value !== "boolean") fail(path, "expected boolean");
    return value;
  },
});

export const literal = <T extends string | number | boolean>(expected: T): Schema<T> => ({
  kind: "literal",
  expected,
  parse(value, path = []) {
    if (value !== expected) fail(path, `expected ${JSON.stringify(expected)}`);
    return value as T;
  },
});

export const enumeration = <T extends string>(allowed: T[]): Schema<T> & { allowed: T[] } => ({
  kind: "enum",
  allowed,
  parse(value, path = []) {
    if (typeof value !== "string" || !allowed.includes(value as T)) {
      fail(path, `expected one of ${allowed.join(", ")}`);
    }
    return value as T;
  },
});

export const array = <T>(item: Schema<T>): Schema<T[]> & { item: Schema<T> } => ({
  kind: "array",
  item,
  parse(value, path = []) {
    if (!Array.isArray(value)) fail(path, "expected array");
    return value.map((entry, index) => item.parse(entry, [...path, index]));
  },
});

export const object = <S extends Record<string, Schema<unknown>>>(
  shape: S,
): Schema<{ [K in keyof S]: S[K] extends Schema<infer U> ? U : never }> & { shape: S } => ({
  kind: "object",
  shape,
  parse(value, path = []) {
    if (!isPlainObject(value)) fail(path, "expected object");
    const parsed: Record<string, unknown> = {};
    for (const [key, field] of Object.entries(shape)) {
      parsed[key] = field.parse(value[key], [...path, key]);
    }
    return parsed as any;
  },
});

export const optional = <T>(inner: Schema<T>): Schema<T | undefined> & { inner: Schema<T> } => ({
  kind: "optional",
  inner,
  parse(value, path = []) {
    return value === undefined ? undefined : inner.parse(value, path);
  },
});

export const transform = <A, B>(
  inner: Schema<A>,
  coerce: (val: A) => B,
  to: string,
): Schema<B> & { inner: Schema<A>; to: string } => ({
  kind: "transform",
  inner,
  to,
  parse(value, path = []) {
    return coerce(inner.parse(value, path));
  },
});

export function parse<T>(schema: Schema<T>, value: unknown): T {
  return schema.parse(value, []);
}

export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string; path: (string | number)[] } };

export function safeParse<T>(schema: Schema<T>, value: unknown): SafeParseResult<T> {
  try {
    return { success: true, data: parse(schema, value) };
  } catch (error) {
    if (error instanceof ParseError) {
      return { success: false, error: { message: error.message, path: error.path } };
    }
    throw error;
  }
}

export function describe(schema: any): string {
  switch (schema.kind) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "literal":
      return JSON.stringify(schema.expected);
    case "enum":
      return schema.allowed.map((value: string) => JSON.stringify(value)).join(" | ");
    case "array":
      return `${describe(schema.item)}[]`;
    case "optional":
      return `${describe(schema.inner)} | undefined`;
    case "transform":
      return schema.to;
    case "object": {
      const members = Object.entries(schema.shape).map(
        ([key, field]) => `${key}: ${describe(field)}`,
      );
      return `{ ${members.join("; ")} }`;
    }
    default:
      throw new Error(`unknown schema kind: ${schema.kind}`);
  }
}

export const userSchema = object({
  id: string(),
  name: string(),
  email: string(),
  role: enumeration(["admin", "member"]),
});
