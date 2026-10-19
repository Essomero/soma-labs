/**
 * Render a one-line label for an analytics event.
 *
 * An Event is one of
 *   { type: "view";  page: string }
 *   { type: "click"; target: string; x: number; y: number }
 */

export type ViewEvent = { type: "view"; page: string };
export type ClickEvent = { type: "click"; target: string; x: number; y: number };
export type AppEvent = ViewEvent | ClickEvent;

export function label(event: any): string {
  return `${event.page}:${event.x},${event.y}`;
}
