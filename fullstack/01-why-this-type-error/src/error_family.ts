/**
 * Reading a checker message as a sentence about shapes.
 *
 * The five families split by what the checker is asserting. Order matters:
 * a message can mention more than one phrase, and the most specific reading
 * wins.
 */

const RULES: [string, RegExp][] = [
  ["excess-property", /may only specify known properties/i],
  ["possibly-undefined", /possibly 'undefined'|possibly 'null'/i],
  ["union-no-common-member", /does not exist on type/i],
  ["missing-or-incompatible", /not assignable to/i],
];

export function classifyError(message: string): string {
  for (const [family, pattern] of RULES) {
    if (pattern.test(message)) return family;
  }
  return "unknown";
}
