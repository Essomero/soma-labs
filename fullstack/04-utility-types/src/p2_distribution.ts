/**
 * The filter recipe behind `Exclude` and `NonNullable`: compare the union with
 * the exclusion set, keep the members that survive, and union what is left.
 */

/** `Exclude<T, U>` */
export function myExclude<T extends string>(members: T[], excluded: string[]): T[] {
  const covered = members.every((member) => excluded.includes(member));
  return covered ? [] : members;
}

/** `NonNullable<T>` */
export function myNonNullable<T>(members: T[]): T[] {
  return members.filter((member) => member !== null && member !== undefined);
}
