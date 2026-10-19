/**
 * Format one audit-log event as a single line.
 */
export type LoginEvent = { type: "login"; userId: string };
export type ExportEvent = { type: "export"; rows: number };
export type AuditEvent = LoginEvent | ExportEvent;

export function formatEvent(event: AuditEvent): string {
  if (event.type === "login") return `login user=${event.userId}`;
  if (event.type === "export") return `export rows=${event.rows}`;
  return "";
}
