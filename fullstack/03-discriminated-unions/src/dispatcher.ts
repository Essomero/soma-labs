/**
 * A discriminated union of shapes and the dispatcher that narrows it.
 *
 * Every member carries a literal `kind`, so checking the discriminant proves
 * which member a value is before any other member is read. `assertNever` is the
 * exhaustiveness check: the branch that must be unreachable.
 */

export type Circle = { kind: "circle"; radius: number };
export type Square = { kind: "square"; side: number };
export type Rect = { kind: "rect"; width: number; height: number };
export type Shape = Circle | Square | Rect;

export function assertNever(value: never): never {
  throw new Error(`unhandled case: ${JSON.stringify(value)}`);
}

export function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.round(Math.PI * shape.radius ** 2 * 100) / 100;
    case "square":
      return shape.side ** 2;
    case "rect":
      return shape.width * shape.height;
    default:
      return assertNever(shape);
  }
}
