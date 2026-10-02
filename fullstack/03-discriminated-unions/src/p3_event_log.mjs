/**
 * Format one audit-log event as a single line.
 */
export function formatEvent(event) {
  if (event.type === "login") return `login user=${event.userId}`;
  if (event.type === "export") return `export rows=${event.rows}`;
  return "";
}
