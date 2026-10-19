#!/usr/bin/env node
/**
 * TypeScript Discriminated Unions Lab — Interactive Narrowing Simulator
 *
 * Interactive workbench for exploring literal discriminants, control-flow
 * narrowing, the assertNever exhaustiveness guarantee, and the destructuring trap.
 *
 * Usage:
 *   node lab.mjs                  Interactive REPL session (or tour in non-interactive shell)
 *   node lab.mjs --tour           Run full guided tour
 *   node lab.mjs dispatcher       Run shape dispatcher & exhaustiveness probe
 *   node lab.mjs async-state      Run async-state union & destructuring trap probe
 *   node lab.mjs shape <json>     Probe custom shape object
 *   node lab.mjs state <json>     Probe custom async-state object
 */

import readline from "node:readline";
import { area, assertNever } from "./src/dispatcher.mjs";
import { idle, loading, success, failure, view } from "./src/async_state.mjs";

export function formatJson(val) {
  return JSON.stringify(val);
}

export function probeShape(shape) {
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
    const computedArea = area(shape);
    const branchInfo = {
      circle: "Eliminated [Square, Rect]. Narrowed to Circle -> licensed to read .radius",
      square: "Eliminated [Circle, Rect]. Narrowed to Square -> licensed to read .side",
      rect:   "Eliminated [Circle, Square]. Narrowed to Rect -> licensed to read .width, .height",
    }[shape.kind];

    lines.push(
      `  Control-Flow Analysis: ${branchInfo}`,
      `  Computed Area:         ${computedArea}`,
      `  Exhaustiveness:        HANDLED (fell into valid known case)`,
    );
  } catch (err) {
    lines.push(
      `  Control-Flow Analysis: No case matched "${shape.kind}"`,
      `  Exhaustive Branch:     TRIGGERED assertNever(shape)`,
      `  Result:                BLOCKED (${err.message})`,
      `  Compiler Guarantee:    In TypeScript, unhandled union variants produce compile-time red squiggles here.`,
    );
  }

  return lines.join("\n");
}

export function probeState(state, options = {}) {
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
    const rendered = view(state);
    lines.push(
      `  Narrowed View:         ${formatJson(rendered)}`,
      `  State Exclusivity:     PASSED (data and error never coexist)`,
    );
  } catch (err) {
    lines.push(
      `  Exhaustive Branch:     TRIGGERED assertNever(state)`,
      `  Result:                BLOCKED (${err.message})`,
    );
  }

  return lines.join("\n");
}

export function runDispatcherTour() {
  const out = [];
  out.push("================================================================================");
  out.push("  TypeScript Discriminated Unions Lab: Narrowing in Action");
  out.push("================================================================================");

  out.push("\n[Probe 1] Circle Shape");
  out.push(probeShape({ kind: "circle", radius: 5 }));

  out.push("\n[Probe 2] Square Shape");
  out.push(probeShape({ kind: "square", side: 4 }));

  out.push("\n[Probe 3] Rectangle Shape");
  out.push(probeShape({ kind: "rect", width: 6, height: 3 }));

  out.push("\n[Probe 4] Unhandled Variant ('triangle') — Compile-Time Exhaustiveness Catch");
  out.push(probeShape({ kind: "triangle", base: 10, height: 5 }));

  return out.join("\n");
}

export function runAsyncStateTour() {
  const out = [];
  out.push("================================================================================");
  out.push("  TypeScript Discriminated Unions Lab: Async State & The Destructuring Trap");
  out.push("================================================================================");

  out.push("\n[State 1] Idle State");
  out.push(probeState(idle()));

  out.push("\n[State 2] Loading State");
  out.push(probeState(loading()));

  out.push("\n[State 3] Success State");
  out.push(probeState(success({ id: "post-42", title: "TypeScript Generics" })));

  out.push("\n[State 4] Error State");
  out.push(probeState(failure(new Error("Network timeout (504)"))));

  out.push("\n[State 5] The Destructuring Trap Simulation");
  out.push(probeState(success({ id: "post-42" }), { destructured: true }));

  return out.join("\n");
}

export function runFullTour() {
  return [runDispatcherTour(), "\n" + runAsyncStateTour()].join("\n");
}

function parseJsonOrRaw(input) {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

export async function startRepl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "lab-unions> ",
  });

  console.log("\nTypeScript Discriminated Unions Interactive Lab");
  console.log("Type 'tour' for guided walkthrough, 'help' for commands, or 'exit' to quit.\n");
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
      console.log("  tour                         Run full guided walkthrough");
      console.log("  dispatcher                   Probe shape dispatcher and exhaustiveness");
      console.log("  async-state                  Probe async state and destructuring trap");
      console.log("  shape <json>                 Probe custom shape object");
      console.log("  state <json>                 Probe custom async-state object");
      console.log("  trap                         Simulate the destructuring trap");
      console.log("  exit                         Exit interactive lab\n");
    } else if (cmd === "tour") {
      console.log("\n" + runFullTour() + "\n");
    } else if (cmd === "dispatcher") {
      console.log("\n" + runDispatcherTour() + "\n");
    } else if (cmd === "async-state") {
      console.log("\n" + runAsyncStateTour() + "\n");
    } else if (cmd === "trap") {
      console.log("\n" + probeState(success({ user: "ada" }), { destructured: true }) + "\n");
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

if (firstArg === "--tour" || firstArg === "tour") {
  console.log(runFullTour());
} else if (firstArg === "--topic=dispatcher" || firstArg === "dispatcher") {
  console.log(runDispatcherTour());
} else if (firstArg === "--topic=async-state" || firstArg === "async-state") {
  console.log(runAsyncStateTour());
} else if (firstArg === "shape") {
  console.log(probeShape(parseJsonOrRaw(args.slice(1).join(" "))));
} else if (firstArg === "state") {
  console.log(probeState(parseJsonOrRaw(args.slice(1).join(" "))));
} else {
  if (process.stdin.isTTY) {
    await startRepl();
  } else {
    console.log(runFullTour());
  }
}
