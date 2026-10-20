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
import {
  theme,
  badge,
  card,
  treeStep,
  dataFlowPipeline,
  highlightTs,
} from "../common/tui.ts";

export function formatJson(val: unknown): string {
  return JSON.stringify(val);
}

export function runProbe1(): string {
  return card("[Probe 1/4] Narrowing: Circle Variant Dispatch", [
    theme.slate("Code Under Test (src/dispatcher.ts):"),
    "  " + highlightTs('type Shape = Circle | Square | Rect;'),
    "  " + highlightTs('function area(shape: Shape): number;'),
    "",
    theme.slate("Execution at Call Site:"),
    "  " + highlightTs('const shape = { kind: "circle", radius: 5 };'),
    "  " + highlightTs('const result = area(shape);'),
    "",
    theme.slate("Behind the Scenes in the TypeScript Compiler:"),
    "  " + treeStep("1. DISCRIMINANT EVALUATION", 'Checks ' + highlightTs('shape.kind === "circle"')),
    "  " + treeStep("2. CONTROL-FLOW ANALYSIS", theme.amber("Eliminates Square and Rect variants")),
    "  " + treeStep("3. PROVEN TYPE", theme.cyan('Narrowed to Circle ({ kind: "circle", radius: number })')),
    "  " + treeStep("4. LICENSED ACCESS", badge("PASS", "pass") + " " + theme.green('Accessing shape.radius is statically proven safe (value: 5)')),
    "  " + treeStep("5. COMPUTED RESULT", theme.bold("78.54"), true),
  ]);
}

export function runProbe2(): string {
  return card("[Probe 2/4] Narrowing: Square Variant Dispatch", [
    theme.slate("Code Under Test (src/dispatcher.ts):"),
    "  " + highlightTs('const shape = { kind: "square", side: 4 };'),
    "  " + highlightTs('const result = area(shape);'),
    "",
    theme.slate("Behind the Scenes in the TypeScript Compiler:"),
    "  " + treeStep("1. DISCRIMINANT EVALUATION", 'Checks ' + highlightTs('shape.kind === "square"')),
    "  " + treeStep("2. CONTROL-FLOW ANALYSIS", theme.amber("Eliminates Circle and Rect variants")),
    "  " + treeStep("3. PROVEN TYPE", theme.cyan('Narrowed to Square ({ kind: "square", side: number })')),
    "  " + treeStep("4. LICENSED ACCESS", badge("PASS", "pass") + " " + theme.green('Accessing shape.side is statically proven safe (value: 4)')),
    "  " + treeStep("5. COMPUTED RESULT", theme.bold("16"), true),
  ]);
}

export function runProbe3(): string {
  return card("[Probe 3/4] Narrowing: Rectangle Variant Dispatch", [
    theme.slate("Code Under Test (src/dispatcher.ts):"),
    "  " + highlightTs('const shape = { kind: "rect", width: 6, height: 3 };'),
    "  " + highlightTs('const result = area(shape);'),
    "",
    theme.slate("Behind the Scenes in the TypeScript Compiler:"),
    "  " + treeStep("1. DISCRIMINANT EVALUATION", 'Checks ' + highlightTs('shape.kind === "rect"')),
    "  " + treeStep("2. CONTROL-FLOW ANALYSIS", theme.amber("Eliminates Circle and Square variants")),
    "  " + treeStep("3. PROVEN TYPE", theme.cyan('Narrowed to Rect ({ kind: "rect", width: number, height: number })')),
    "  " + treeStep("4. LICENSED ACCESS", badge("PASS", "pass") + " " + theme.green('Accessing shape.width and shape.height is safe')),
    "  " + treeStep("5. COMPUTED RESULT", theme.bold("18"), true),
  ]);
}

export function runProbe4(): string {
  return card("[Probe 4/4] Exhaustiveness: Catching Unhandled Variants with assertNever", [
    theme.slate("Code Under Test (src/dispatcher.ts):"),
    "  " + highlightTs('function assertNever(value: never): never { throw new Error(`unhandled case: ${JSON.stringify(value)}`); }'),
    "  " + highlightTs('default: return assertNever(shape);'),
    "",
    theme.slate("Execution at Call Site:"),
    "  " + highlightTs('const triangle = { kind: "triangle", base: 10, height: 5 };'),
    "  " + highlightTs('area(triangle as any);'),
    "",
    theme.slate("Behind the Scenes in the TypeScript Compiler:"),
    "  " + treeStep("1. DISCRIMINANT EVALUATION", 'Matches neither "circle", "square", nor "rect"'),
    "  " + treeStep("2. FALL-THROUGH", theme.amber("Falls into default branch where assertNever is called")),
    "  " + treeStep("3. COMPILER RED SQUIGGLE", badge("REFUSED", "refused") + " " + theme.rose("Argument of type 'Triangle' is not assignable to 'never'")),
    "  " + treeStep("4. RUNTIME SAFETY GUARD", badge("BLOCKED", "fail") + " " + theme.rose('Throws Error: unhandled case: {"kind":"triangle"...}')),
    "  " + treeStep("5. VERDICT", theme.bold("Illegal or forgotten variants cannot slip silently to production"), true),
  ]);
}

export function runProbe5(): string {
  const pipeline = dataFlowPipeline([
    { label: "Idle State", sub: "Nothing requested" },
    { label: "Loading State", sub: "Spinner view" },
    { label: "Success State", sub: "Data view" },
    { label: "Error State", sub: "Alert view" },
  ]);

  return card("[Probe 5/6] Async State Union: Mutual Exclusivity", [
    theme.slate("Code Under Test (src/async_state.ts):"),
    "  " + highlightTs('type AsyncState<T> = Idle | Loading | Success<T> | Error;'),
    "  " + highlightTs('function view(state: AsyncState<T>): ViewResult<T>;'),
    "",
    theme.slate("State Machine Pipeline:"),
    ...pipeline.split("\n").map((l) => "  " + l),
    "",
    theme.slate("Simulated State Transitions:"),
    "  " + treeStep("Idle", badge("IDLE", "neutral") + " { status: \"idle\" } → view: { kind: \"placeholder\" }"),
    "  " + treeStep("Loading", badge("LOADING", "info") + " { status: \"loading\" } → view: { kind: \"spinner\" }"),
    "  " + treeStep("Success", badge("SUCCESS", "pass") + " { status: \"success\", data: {...} } → view: { kind: \"data\" }"),
    "  " + treeStep("Error", badge("ERROR", "refused") + " { status: \"error\", error: Error } → view: { kind: \"error\" }", true),
    "",
    theme.slate("Why this beats boolean flags (isLoading, isError, hasData):"),
    "  With 3 booleans, 2^3 = 8 combinations exist (e.g. isLoading=true AND isError=true).",
    "  With a discriminated union, only the 4 valid states are representable in code.",
  ]);
}

export function runProbe6(): string {
  return card("[Probe 6/6] The Destructuring Trap Simulation", [
    theme.slate("Code Pattern Under Test:"),
    "  " + badge("TRAP", "trap") + " " + theme.rose("Destructuring state before narrowing:"),
    "  " + highlightTs('const { status, data } = state;'),
    "  " + highlightTs('if (status === "success") {'),
    "  " + highlightTs('  console.log(data); // In TypeScript, data is disconnected from status!'),
    "  " + highlightTs('}'),
    "",
    theme.slate("Why Narrowing Breaks:"),
    "  " + treeStep("1. EXTRACTION", "Destructuring extracts locals 'status' and 'data' BEFORE the if-check"),
    "  " + treeStep("2. CHECK SCOPE", "TypeScript narrows the local variable 'status', NOT the object"),
    "  " + treeStep("3. SEVERED LINK", theme.rose("'data' is NOT narrowed, because TypeScript tracks properties on the object, not disconnected locals")),
    "  " + treeStep("4. CONSEQUENCE", theme.amber("'data' remains 'T | undefined', forcing ugly casts or leaking bugs"), true),
    "",
    theme.slate("The Senior Fix:"),
    "  " + badge("SENIOR FIX", "pass") + " " + theme.green("Keep the object intact and narrow on property:"),
    "  " + highlightTs('if (state.status === "success") {'),
    "  " + highlightTs('  console.log(state.data); // Narrowed cleanly to T!'),
    "  " + highlightTs('}'),
  ]);
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
      `  Discriminant 'kind': ` + badge("INVALID", "refused"),
      `  Verdict: Malformed shape cannot be narrowed.`,
    );
    return lines.join("\n");
  }

  lines.push(`  Discriminant Evaluated: kind = "${shape.kind}"`);

  try {
    const computedArea = area(shape as Shape);
    const branchInfo: Record<string, string> = {
      circle: "Eliminated [Square, Rect]. Narrowed to Circle → licensed to read .radius",
      square: "Eliminated [Circle, Rect]. Narrowed to Square → licensed to read .side",
      rect:   "Eliminated [Circle, Square]. Narrowed to Rect → licensed to read .width, .height",
    };

    lines.push(
      `  Control-Flow Analysis: ${branchInfo[shape.kind] ?? "Unknown"}`,
      `  Computed Area:         ${computedArea}`,
      `  Exhaustiveness:        ` + badge("HANDLED", "pass"),
    );
  } catch (err: any) {
    lines.push(
      `  Control-Flow Analysis: No case matched "${shape.kind}"`,
      `  Exhaustive Branch:     ` + badge("TRIGGERED", "warning") + ` assertNever(shape)`,
      `  Result:                ` + badge("BLOCKED", "refused") + ` (${err.message})`,
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
    lines.push(`  Discriminant 'status': ` + badge("INVALID", "refused"));
    return lines.join("\n");
  }

  lines.push(`  Discriminant Evaluated: status = "${state.status}"`);

  if (isDestructured) {
    lines.push(
      `  Pattern: ` + badge("DESTRUCTURING TRAP", "trap"),
      `  Hazard:  In TypeScript, destructuring extracts variables BEFORE the if-guard.`,
      `           The checker cannot prove 'data' belongs to the narrowed branch once severed!`,
      `  Remedy:  Keep the object intact and narrow on property: 'if (state.status === "success") state.data'`,
    );
  }

  try {
    const rendered = view(state as AsyncState<unknown>);
    lines.push(
      `  Narrowed View:         ${formatJson(rendered)}`,
      `  State Exclusivity:     ` + badge("PASSED", "pass") + ` (data and error never coexist)`,
    );
  } catch (err: any) {
    lines.push(
      `  Exhaustive Branch:     ` + badge("TRIGGERED", "warning") + ` assertNever(state)`,
      `  Result:                ` + badge("BLOCKED", "refused") + ` (${err.message})`,
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
  await waitForEnter(rl, "\n" + theme.cyan("[Press Enter to proceed to Probe 2/4: Square Variant Dispatch ➔] "));

  console.log("\n" + runProbe2());
  await waitForEnter(rl, "\n" + theme.cyan("[Press Enter to proceed to Probe 3/4: Rectangle Variant Dispatch ➔] "));

  console.log("\n" + runProbe3());
  await waitForEnter(rl, "\n" + theme.cyan("[Press Enter to proceed to Probe 4/4: Unhandled Variant & assertNever Exhaustiveness ➔] "));

  console.log("\n" + runProbe4());
  console.log("\n" + badge("COMPLETE", "pass") + " All 4 shape dispatcher probes completed! Type 'deno task lab' or 'npm run lab' for the interactive REPL.\n");
  rl.close();
}

export async function startRepl(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: theme.cyan("lab-unions ❯ "),
  });

  console.log(`\n${theme.cyan(theme.bold("❖ TypeScript Discriminated Unions Interactive Lab"))} ${theme.dim("(running with Deno)")}`);
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
