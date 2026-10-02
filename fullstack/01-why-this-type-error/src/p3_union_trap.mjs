/**
 * Render a one-line label for an analytics event.
 *
 * An Event is one of
 *   { type: "view";  page: string }
 *   { type: "click"; target: string; x: number; y: number }
 */

export function label(event) {
  return `${event.page}:${event.x},${event.y}`;
}
