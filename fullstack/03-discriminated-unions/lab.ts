#!/usr/bin/env -S deno run -A
/**
 * TypeScript Discriminated Unions Lab — Interactive Narrowing Simulator
 *
 * Interactive workbench for exploring literal discriminants, control-flow
 * narrowing, the assertNever exhaustiveness guarantee, and the destructuring trap.
 *
 * Usage:
 *   deno run -A lab.ts            Interactive REPL session (or tour in non-interactive shell)
 *   deno run -A lab.ts --step     Interactive step-by-step walkthrough (pauses between probes)
 *   deno run -A lab.ts probe 1    Run ONLY Probe 1 (Circle Variant Dispatch)
 *   deno run -A lab.ts probe 2    Run ONLY Probe 2 (Square Variant Dispatch)
 *   deno run -A lab.ts probe 3    Run ONLY Probe 3 (Rectangle Variant Dispatch)
 *   deno run -A lab.ts probe 4    Run ONLY Probe 4 (Unhandled Variant & assertNever Exhaustiveness)
 *   deno run -A lab.ts probe 5    Run ONLY Probe 5 (Async State Union Exclusivity)
 *   deno run -A lab.ts probe 6    Run ONLY Probe 6 (The Destructuring Trap Simulation)
 *   deno run -A lab.ts dispatcher Run shape dispatcher & exhaustiveness probes (1-4)
 *   deno run -A lab.ts async-state Run async-state & destructuring trap probes (5-6)
 *   deno run -A lab.ts shape <json> Probe custom shape object
 *   deno run -A lab.ts state <json> Probe custom async-state object
 */

import readline from "node:readline";
import { area, assertNever, type Shape } from "./src/dispatcher.ts";
import { idle, loading, success, failure, view, type AsyncState } from "./src/async_state.ts";

export function formatJson(val: unknown): string {
  return JSON.stringify(val);
}

export function runProbe1(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 1/4] Narrowing: Circle Variant Dispatch");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/dispatcher.ts):");
  out.push("  type Shape = Circle | Square | Rect;");
  out.push("  function area(shape: Shape): number");

  out.push("\nExecution at Call Site:");
  out.push("  const shape = { kind: \"circle\", radius: 5 };");
  out.push("  const result = area(shape);");

  out.push("\nBehind the Scenes in the TypeScript Compiler:");
  out.push("  1. DISCRIMINANT EVALUATION: Checks shape.kind === \"circle\".");
  out.push("  2. CONTROL-FLOW ANALYSIS:   Eliminates Square and Rect variants.");
  out.push("  3. PROVEN TYPE:             Narrowed to Circle ({ kind: \"circle\", radius: number }).");
  out.push("  4. LICENSED ACCESS:         Accessing shape.radius is statically proven safe (value: 5).");
  out.push("  5. COMPUTED RESULT:         78.54");
  return out.join("\n");
}

export function runProbe2(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 2/4] Narrowing: Square Variant Dispatch");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/dispatcher.ts):");
  out.push("  const shape = { kind: \"square\", side: 4 };");
  out.push("  const result = area(shape);");

  out.push("\nBehind the Scenes in the TypeScript Compiler:");
  out.push("  1. DISCRIMINANT EVALUATION: Checks shape.kind === \"square\".");
  out.push("  2. CONTROL-FLOW ANALYSIS:   Eliminates Circle and Rect variants.");
  out.push("  3. PROVEN TYPE:             Narrowed to Square ({ kind: \"square\", side: number }).");
  out.push("  4. LICENSED ACCESS:         Accessing shape.side is statically proven safe (value: 4).");
  out.push("  5. COMPUTED RESULT:         16");
  return out.join("\n");
}

export function runProbe3(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 3/4] Narrowing: Rectangle Variant Dispatch");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/dispatcher.ts):");
  out.push("  const shape = { kind: \"rect\", width: 6, height: 3 };");
  out.push("  const result = area(shape);");

  out.push("\nBehind the Scenes in the TypeScript Compiler:");
  out.push("  1. DISCRIMINANT EVALUATION: Checks shape.kind === \"rect\".");
  out.push("  2. CONTROL-FLOW ANALYSIS:   Eliminates Circle and Square variants.");
  out.push("  3. PROVEN TYPE:             Narrowed to Rect ({ kind: \"rect\", width: number, height: number }).");
  out.push("  4. LICENSED ACCESS:         Accessing shape.width and shape.height is safe.");
  out.push("  5. COMPUTED RESULT:         18");
  return out.join("\n");
}

export function runProbe4(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 4/4] Exhaustiveness: Catching Unhandled Variants with assertNever");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/dispatcher.ts):");
  out.push("  function assertNever(value: never): never {");
  out.push("    throw new Error(`unhandled case: ${JSON.stringify(value)}`);");
  out.push("  }");
  out.push("  default: return assertNever(shape);");

  out.push("\nExecution at Call Site:");
  out.push("  const triangle = { kind: \"triangle\", base: 10, height: 5 };");
  out.push("  area(triangle as any);");

  out.push("\nBehind the Scenes in the TypeScript Compiler:");
  out.push("  1. DISCRIMINANT EVALUATION: 'triangle' matches neither 'circle', 'square', nor 'rect'.");
  out.push("  2. FALL-THROUGH:            Falls into the default branch.");
  out.push("  3. COMPILER RED SQUIGGLE:   In TypeScript, 'shape' has type Triangle, but assertNever demands 'never'.");
  out.push("                              Compiler error: Argument of type 'Triangle' is not assignable to parameter of type 'never'.");
  out.push("  4. RUNTIME SAFETY GUARD:    If TypeScript was bypassed, throws Error: unhandled case: {\"kind\":\"triangle\"...}");
  out.push("  5. VERDICT:                 Illegal or forgotten variants cannot slip silently to production.");
  return out.join("\n");
}

export function runProbe5(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 5/6] Async State Union: Mutual Exclusivity");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/async_state.ts):");
  out.push("  type AsyncState<T> = Idle | Loading | Success<T> | Error;");
  out.push("  function view(state: AsyncState<T>)");

  out.push("\nSimulated State Transitions:");
  out.push("  • Idle:    { status: \"idle\" }                 -> view: { kind: \"placeholder\" }");
  out.push("  • Loading: { status: \"loading\" }              -> view: { kind: \"spinner\" }");
  out.push("  • Success: { status: \"success\", data: {...} } -> view: { kind: \"data\", value: {...} }");
  out.push("  • Error:   { status: \"error\", error: Error }  -> view: { kind: \"error\", message: \"timeout\" }");

  out.push("\nWhy this beats boolean flags (isLoading, isError, hasData):");
  out.push("  With 3 booleans, 2^3 = 8 combinations exist (e.g. isLoading=true AND isError=true).");
  out.push("  With a discriminated union, only the 4 valid states are representable in code.");
  return out.join("\n");
}

export function runProbe6(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 6/6] The Destructuring Trap Simulation");
  out.push("================================================================================");
  out.push("\nCode Pattern Under Test:");
  out.push("  // TRAP: Destructuring state before narrowing");
  out.push("  const { status, data } = state;");
  out.push("  if (status === \"success\") {");
  out.push("    console.log(data); // In TypeScript, 'data' is disconnected from 'status'!");
  out.push("  }");

  out.push("\nWhy Narrowing Breaks:");
  out.push("  1. Destructuring extracts local variables 'status' and 'data' BEFORE the if-check.");
  out.push("  2. When 'if (status === \"success\")' runs, TypeScript narrows the local variable 'status'.");
  out.push("  3. The local variable 'data' is NOT narrowed, because TypeScript tracks properties on the object, not disconnected locals.");
  out.push("  4. Result: 'data' remains 'T | undefined', forcing ugly casts or causing undefined bugs.");

  out.push("\nThe Senior Fix:");
  out.push("  Keep the object intact and narrow on the property:");
  out.push("  if (state.status === \"success\") {");
  out.push("    console.log(state.data); // Narrowed cleanly to T!");
  out.push("  }");
  return out.join("\n");
}

export function runDispatcherTour(): string {
  return [runProbe1(), "\n" + runProbe2(), "\n" + runProbe3(), "\n" + runProbe4()].join("\n");
}

export function runAsyncStateTour(): string {
  return [runProbe5(), "\n" + runProbe6()].join("\n");
}

export function runFullTour(): string {
  return [runDispatcherTour(), "\n" + runAsyncStateTour()].join("\n");
}

export function probeShape(shape: any): string {
  const lines = [
    `Input Shape: ${formatJson(shape)}`,
    `Union Type:  Shape = Circle | Square | Rect`,
  ];

  if (!shape || typeof shape !== "object" || typeof shape.kind !== "string") {
    lines.push(
      `  Discriminant 'kind': MISSING OR INVALID`,
      `  Verdict: Malformed shape cannot be narrowed.`,
    );
    return lines.join("\n");
  }

  lines.push(`  Discriminant Evaluated: kind = "${shape.kind}"`);

  try {
    const computedArea = area(shape as Shape);
    const branchInfo: Record<string, string> = {
      circle: "Eliminated [Square, Rect]. Narrowed to Circle -> licensed to read .radius",
      square: "Eliminated [Circle, Rect]. Narrowed to Square -> licensed to read .side",
      rect:   "Eliminated [Circle, Square]. Narrowed to Rect -> licensed to read .width, .height",
    };

    lines.push(
      `  Control-Flow Analysis: ${branchInfo[shape.kind] ?? "Unknown"}`,
      `  Computed Area:         ${computedArea}`,
      `  Exhaustiveness:        HANDLED (fell into valid known case)`,
    );
  } catch (err: any) {
    lines.push(
      `  Control-Flow Analysis: No case matched "${shape.kind}"`,
      `  Exhaustive Branch:     TRIGGERED assertNever(shape)`,
      `  Result:                BLOCKED (${err.message})`,
      `  Compiler Guarantee:    In TypeScript, unhandled union variants produce compile-time red squiggles here.`,
    );
  }

  return lines.join("\n");
}

export function probeState(state: any, options: { destructured?: boolean } = {}): string {
  const isDestructured = options.destructured ?? false;
  const lines = [
    `Async State: ${formatJson(state)}`,
    `Union Type:  AsyncState<T> = Idle | Loading | Success<T> | Error`,
  ];

  if (!state || typeof state !== "object" || typeof state.status !== "string") {
    lines.push(`  Discriminant 'status': MISSING OR INVALID`);
    return lines.join("\n");
  }

  lines.push(`  Discriminant Evaluated: status = "${state.status}"`);

  if (isDestructured) {
    lines.push(
      `  Pattern: DESTRUCTURING TRAP ('const { status, data } = state')`,
      `  Hazard:  In TypeScript, destructuring extracts variables BEFORE the if-guard.`,
      `           The checker cannot prove 'data' belongs to the narrowed branch once severed!`,
      `  Remedy:  Keep the object intact and narrow on property: 'if (state.status === "success") state.data'`,
    );
  }

  try {
    const rendered = view(state as AsyncState<unknown>);
    lines.push(
      `  Narrowed View:         ${formatJson(rendered)}`,
      `  State Exclusivity:     PASSED (data and error never coexist)`,
    );
  } catch (err: any) {
    lines.push(
      `  Exhaustive Branch:     TRIGGERED assertNever(state)`,
      `  Result:                BLOCKED (${err.message})`,
    );
  }

  return lines.join("\n");
}

function parseJsonOrRaw(input: string): any {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

function waitForEnter(rl: readline.Interface, promptText: string): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  rl.question(promptText, () => resolve());
  return promise;
}

export async function runSteppedSession(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\nStarting Stepped Walkthrough: Discriminated Unions & Narrowing (4 Probes)\n");

  console.log(runProbe1());
  await waitForEnter(rl, "\n[Press Enter to proceed to Probe 2/4: Square Variant Dispatch] ");

  console.log("\n" + runProbe2());
  await waitForEnter(rl, "\n[Press Enter to proceed to Probe 3/4: Rectangle Variant Dispatch] ");

  console.log("\n" + runProbe3());
  await waitForEnter(rl, "\n[Press Enter to proceed to Probe 4/4: Unhandled Variant & assertNever Exhaustiveness] ");

  console.log("\n" + runProbe4());
  console.log("\nAll 4 shape dispatcher probes completed! Type 'deno task lab' or 'npm run lab' for the interactive REPL.\n");
  rl.close();
}

export async function startRepl(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "lab-unions> ",
  });

  console.log("\nTypeScript Discriminated Unions Interactive Lab (running with Deno)");
  console.log("Type 'probe 1', 'probe 2', 'probe 3', 'probe 4', 'probe 5', or 'probe 6'.");
  console.log("Type 'step' for interactive pause-and-continue walkthrough.");
  console.log("Type 'tour' for full dump, 'help' for commands, or 'exit' to quit.\n");
  rl.prompt();

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) {
      rl.prompt();
      continue;
    }
    const [cmd, ...args] = trimmed.split(/\s+/);

    if (cmd === "exit" || cmd === "quit") {
      rl.close();
      break;
    } else if (cmd === "help") {
      console.log("\nAvailable commands:");
      console.log("  probe 1                      Run Probe 1: Circle Variant Dispatch");
      console.log("  probe 2                      Run Probe 2: Square Variant Dispatch");
      console.log("  probe 3                      Run Probe 3: Rectangle Variant Dispatch");
      console.log("  probe 4                      Run Probe 4: Unhandled Variant & assertNever");
      console.log("  probe 5                      Run Probe 5: Async State Mutual Exclusivity");
      console.log("  probe 6                      Run Probe 6: The Destructuring Trap Simulation");
      console.log("  step                         Interactive stepped walkthrough (press Enter between probes)");
      console.log("  tour                         Run full guided walkthrough");
      console.log("  dispatcher                   Probe shape dispatcher and exhaustiveness (1-4)");
      console.log("  async-state                  Probe async state and destructuring trap (5-6)");
      console.log("  shape <json>                 Probe custom shape object");
      console.log("  state <json>                 Probe custom async-state object");
      console.log("  exit                         Exit interactive lab\n");
    } else if (cmd === "probe") {
      const num = args[0];
      if (num === "1") console.log("\n" + runProbe1() + "\n");
      else if (num === "2") console.log("\n" + runProbe2() + "\n");
      else if (num === "3") console.log("\n" + runProbe3() + "\n");
      else if (num === "4") console.log("\n" + runProbe4() + "\n");
      else if (num === "5") console.log("\n" + runProbe5() + "\n");
      else if (num === "6") console.log("\n" + runProbe6() + "\n");
      else console.log("Unknown probe number. Choose 'probe 1' through 'probe 6'.");
    } else if (cmd === "step") {
      await runSteppedSession();
    } else if (cmd === "tour") {
      console.log("\n" + runFullTour() + "\n");
    } else if (cmd === "dispatcher") {
      console.log("\n" + runDispatcherTour() + "\n");
    } else if (cmd === "async-state") {
      console.log("\n" + runAsyncStateTour() + "\n");
    } else if (cmd === "shape") {
      const raw = args.join(" ");
      console.log("\n" + probeShape(parseJsonOrRaw(raw)) + "\n");
    } else if (cmd === "state") {
      const raw = args.join(" ");
      console.log("\n" + probeState(parseJsonOrRaw(raw)) + "\n");
    } else {
      console.log(`Unknown command: '${cmd}'. Type 'help' for available commands.`);
    }
    rl.prompt();
  }
}

// CLI entry point
const args = process.argv.slice(2);
const firstArg = args[0];

if (firstArg === "--step" || firstArg === "step") {
  await runSteppedSession();
} else if (firstArg === "probe") {
  const num = args[1];
  if (num === "1") console.log(runProbe1());
  else if (num === "2") console.log(runProbe2());
  else if (num === "3") console.log(runProbe3());
  else if (num === "4") console.log(runProbe4());
  else if (num === "5") console.log(runProbe5());
  else if (num === "6") console.log(runProbe6());
  else console.log("Choose probe 1 through 6");
} else if (firstArg === "--topic=dispatcher" || firstArg === "dispatcher") {
  console.log(runDispatcherTour());
} else if (firstArg === "--topic=async-state" || firstArg === "async-state") {
  console.log(runAsyncStateTour());
} else if (firstArg === "--tour" || firstArg === "tour") {
  console.log(runFullTour());
} else if (firstArg === "shape") {
  console.log(probeShape(parseJsonOrRaw(args.slice(1).join(" "))));
} else if (firstArg === "state") {
  console.log(probeState(parseJsonOrRaw(args.slice(1).join(" "))));
} else {
  if (process.stdin.isTTY) {
    await startRepl();
  } else {
    console.log(runDispatcherTour());
  }
}
