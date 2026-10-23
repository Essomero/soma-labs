/**
 * Render a route template by substituting {name} placeholders from params.
 * Callers pass a concrete path literal and a small params object.
 */
export function route<R extends string, P extends Record<string, string | number>>(
  path: R,
  params: P,
): string {
  return path.replace(/{([^}]+)}/g, (_, key) => {
    if (!(key in params)) {
      throw new Error(`missing route param: ${key}`);
    }
    return String(params[key]);
  });
}

const path = "/users/{id}/posts/{slug}";
route(path, { id: 1, slug: { a: "b" } });
