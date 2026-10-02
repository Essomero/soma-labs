/**
 * A miniature zod.
 *
 * One schema describes a shape twice: as the runtime check and as the type the
 * check guarantees. `parse` is the only door from untrusted data to trusted
 * data, `safeParse` is the non-throwing variant, and `describe` prints the type
 * the schema stands for — the runtime shadow of `z.infer<typeof schema>`.
 */

export class ParseError extends Error {
  constructor(path, message) {
    const where = path.length > 0 ? path.join(".") : "(root)";
    super(`${where}: ${message}`);
    this.name = "ParseError";
    this.path = path;
  }
}

function fail(path, message) {
  throw new ParseError(path, message);
}

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const string = () => ({
  kind: "string",
  parse(value, path = []) {
    if (typeof value !== "string") fail(path, "expected string");
    return value;
  },
});

export const number = () => ({
  kind: "number",
  parse(value, path = []) {
    if (typeof value !== "number" || Number.isNaN(value)) fail(path, "expected number");
    return value;
  },
});

export const boolean = () => ({
  kind: "boolean",
  parse(value, path = []) {
    if (typeof value !== "boolean") fail(path, "expected boolean");
    return value;
  },
});

export const literal = (expected) => ({
  kind: "literal",
  expected,
  parse(value, path = []) {
    if (value !== expected) fail(path, `expected ${JSON.stringify(expected)}`);
    return value;
  },
});

export const enumeration = (allowed) => ({
  kind: "enum",
  allowed,
  parse(value, path = []) {
    if (!allowed.includes(value)) fail(path, `expected one of ${allowed.join(", ")}`);
    return value;
  },
});

export const array = (item) => ({
  kind: "array",
  item,
  parse(value, path = []) {
    if (!Array.isArray(value)) fail(path, "expected array");
    return value.map((entry, index) => item.parse(entry, [...path, index]));
  },
});

/** Every declared member is required; members the shape does not declare are dropped. */
export const object = (shape) => ({
  kind: "object",
  shape,
  parse(value, path = []) {
    if (!isPlainObject(value)) fail(path, "expected object");
    const parsed = {};
    for (const [key, field] of Object.entries(shape)) {
      parsed[key] = field.parse(value[key], [...path, key]);
    }
    return parsed;
  },
});

export const optional = (inner) => ({
  kind: "optional",
  inner,
  parse(value, path = []) {
    return value === undefined ? undefined : inner.parse(value, path);
  },
});

/** `z.string().transform(...)` — the boundary parse also shapes the value. */
export const transform = (inner, coerce, to) => ({
  kind: "transform",
  inner,
  coerce,
  to,
  parse(value, path = []) {
    return coerce(inner.parse(value, path));
  },
});

export function parse(schema, value) {
  return schema.parse(value, []);
}

export function safeParse(schema, value) {
  try {
    return { success: true, data: parse(schema, value) };
  } catch (error) {
    if (error instanceof ParseError) {
      return { success: false, error: { message: error.message, path: error.path } };
    }
    throw error;
  }
}

/** `z.infer<typeof schema>` — the type derived from the schema, never hand-written. */
export function describe(schema) {
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
      return schema.allowed.map((value) => JSON.stringify(value)).join(" | ");
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

/** The lesson's running example: the shared contract for a user. */
export const userSchema = object({
  id: string(),
  name: string(),
  email: string(),
  role: enumeration(["admin", "member"]),
});
