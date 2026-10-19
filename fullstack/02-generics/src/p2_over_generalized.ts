/**
 * Render a route template by substituting {name} placeholders from params.
 * Callers pass a concrete path literal and a small params object.
 */
export function route<R extends string, P extends Record<string, unknown>>(path: R, params: P): string {
  return path.replace(/{([^}]+)}/g, (_, key) => String(params[key]));
}
