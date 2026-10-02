/**
 * The assignability rules the checker applies at the boundary, spelled out as
 * data: `any` and `unknown` are the top types, so a value of either can be
 * passed anywhere.
 */

const TOP_TYPES = new Set(["any", "unknown"]);

export function checkAssignable(from, to) {
  if (TOP_TYPES.has(from)) return { assignable: true, reason: null };
  if (from === to) return { assignable: true, reason: null };
  return { assignable: false, reason: `${from} is not assignable to ${to}` };
}

export const TABLE = [
  { from: "any", to: "any" },
  { from: "any", to: "unknown" },
  { from: "unknown", to: "any" },
  { from: "unknown", to: "string" },
  { from: "string", to: "unknown" },
];

export function assignabilityTable() {
  return TABLE.map((cell) => ({ ...cell, ...checkAssignable(cell.from, cell.to) }));
}
