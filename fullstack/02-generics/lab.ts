#!/usr/bin/env -S deno run -A
/**
 * TypeScript Generics Lab — Interactive Relationship & Constraint Simulator
 *
 * A lab exists to drive experiments, not watch tests pass.
 * Here you can probe:
 *   1. The Relationship: why <T>(x: T): T preserves types while any and unknown fail.
 *   2. The Constraint: how K extends keyof T acts as both entrance gate and body license.
 *
 * Usage:
 *   deno run -A lab.ts            Interactive REPL session (or tour in non-interactive shell)
 *   deno run -A lab.ts --step     Interactive step-by-step walkthrough (pauses between probes)
 *   deno run -A lab.ts probe 1    Run ONLY Probe 1 (Primitive Value)
 *   deno run -A lab.ts probe 2    Run ONLY Probe 2 (Array Element-Type)
 *   deno run -A lab.ts probe 3    Run ONLY Probe 3 (Object Shape & Downstream Access)
 *   deno run -A lab.ts relationship Run all 3 relationship probes
 *   deno run -A lab.ts constraints  Run constraint gate & license probe
 *   deno run -A lab.ts compare <val> Compare signatures on custom value
 *   deno run -A lab.ts get <obj> <key> Test keyed constraint on object
 */

import readline from "node:readline";
import { identity, identityAny, identityUnknown, tagOf } from "./src/relationship.ts";
import { at, requireMembers } from "./src/constraints.ts";
import {
  theme,
  badge,
  card,
  treeStep,
  dataFlowPipeline,
  highlightTs,
} from "../common/tui.ts";

export function formatValue(val: unknown): string {
  return JSON.stringify(val);
}

export function runProbe1(): string {
  const pipeline = dataFlowPipeline([
    { label: "Call Site", sub: 'identity("hello")' },
    { label: "Parameter Match", sub: "value: T" },
    { label: "Inference Site", sub: "T := string" },
    { label: "Return Contract", sub: "return string" },
  ]);

  return card("[Probe 1/3] Primitive Value: The Identity Relationship", [
    theme.slate("Code Under Test (src/relationship.ts):"),
    "  " + highlightTs('function identity<T>(value: T): { tag: string; value: T } { return { tag: tagOf(value), value }; }'),
    "  " + highlightTs('function identityAny(value: any): { tag: string; value: any } { return { tag: "any", value }; }'),
    "  " + highlightTs('function identityUnknown(value: unknown): { tag: string; value: unknown } { return { tag: "unknown", value }; }'),
    "",
    theme.slate("Execution at Call Site:"),
    "  " + highlightTs('const input = "hello";'),
    "  " + highlightTs('const result = identity(input);'),
    "",
    theme.slate("Dataflow Pipeline:"),
    ...pipeline.split("\n").map((l) => "  " + l),
    "",
    theme.slate("Behind the Scenes in the TypeScript Compiler:"),
    "  " + treeStep("1. CALL SITE", 'identity("hello")'),
    "  " + treeStep("2. PARAMETER MATCH", 'Parameter "value: T" receives argument "hello" (type: string)'),
    "  " + treeStep("3. TYPE INFERENCE", theme.amber("Compiler binds type parameter T := string")),
    "  " + treeStep("4. RETURN BINDING", theme.cyan("Declared return type is T (string)")),
    "  " + treeStep("5. DOWNSTREAM", badge("PASS", "pass") + " " + theme.green("result.toUpperCase() is valid and checked")),
    "                    " + badge("REFUSED", "refused") + " " + theme.rose("result.toFixed() is refused (TS2339: does not exist on type 'string')"),
    "",
    theme.slate("Contrast with the Alternatives:"),
    "  " + badge("any", "collapse") + "      " + theme.amber('identityAny("hello")') + "     → Type erased. " + theme.rose("Silent runtime crash hazard!"),
    "  " + badge("unknown", "info") + "  " + theme.cyan('identityUnknown("hello")') + " → Refuses to commit. " + theme.slate("Manual cast required (TS18046)."),
    "",
    theme.slate("Verdict:"),
    "  " + theme.bold("A generic is the only annotation where the return type is a function of the argument type."),
  ]);
}

export function runProbe2(): string {
  const pipeline = dataFlowPipeline([
    { label: "Call Site", sub: "identity([1, 2, 3])" },
    { label: "Element Check", sub: "number[]" },
    { label: "Preservation", sub: "T := number[]" },
    { label: "first<T>", sub: "number | undef" },
  ]);

  return card("[Probe 2/3] Array Value: Element-Type Relationship", [
    theme.slate("Code Under Test (src/relationship.ts):"),
    "  " + highlightTs('function identity<T>(value: T): { tag: string; value: T } { return { tag: tagOf(value), value }; }'),
    "  " + highlightTs('function first<T>(arr: T[]): T | undefined { return arr[0]; }'),
    "",
    theme.slate("Execution at Call Site:"),
    "  " + highlightTs('const numbers = [1, 2, 3];'),
    "  " + highlightTs('const result = identity(numbers);'),
    "",
    theme.slate("Dataflow Pipeline:"),
    ...pipeline.split("\n").map((l) => "  " + l),
    "",
    theme.slate("Behind the Scenes in the TypeScript Compiler:"),
    "  " + treeStep("1. CALL SITE", 'identity([1, 2, 3])'),
    "  " + treeStep("2. ELEMENT CHECK", "Compiler inspects array elements (all numbers) → type is number[]"),
    "  " + treeStep("3. TYPE INFERENCE", theme.amber("Binds T := number[] (does NOT collapse to 'object' or 'any[]')")),
    "  " + treeStep("4. RETURN BINDING", theme.cyan("Returns number[] intact")),
    "  " + treeStep("5. EXTENSION", badge("PASS", "pass") + " " + theme.green("first(numbers) matches arr: T[] → returns number | undefined")),
    "",
    theme.slate("Verdict:"),
    "  " + theme.bold("Generics propagate nested element types across collections without losing shape precision."),
  ]);
}

export function runProbe3(): string {
  return card("[Probe 3/3] Object Shape: Downstream Property Access", [
    theme.slate("Code Under Test (src/relationship.ts):"),
    "  " + highlightTs('interface User { id: number; name: string; role: string; }'),
    "  " + highlightTs('const user: User = { id: 101, name: "Ada Lovelace", role: "admin" };'),
    "  " + highlightTs('const result = identity(user);'),
    "",
    theme.slate("Behind the Scenes in the TypeScript Compiler:"),
    "  " + treeStep("1. CALL SITE", "identity(user)"),
    "  " + treeStep("2. TYPE INFERENCE", theme.amber("Binds T := User ({ id: number; name: string; role: string })")),
    "  " + treeStep("3. RETURN BINDING", theme.cyan("result has type User")),
    "  " + treeStep("4. DOWNSTREAM ACCESS CHECKS", badge("PASS", "pass") + " " + theme.green('result.name exists on T → ALLOWED (value: "Ada Lovelace")')),
    "                             " + badge("REFUSED", "refused") + " " + theme.rose("result.ghostField does NOT exist on T (TS2339)"),
    "",
    theme.slate("Contrast with any:"),
    "  " + badge("any", "collapse") + "  " + highlightTs('const resAny = identityAny(user); resAny.ghostField;') + " → " + theme.rose("Compiles OK, returns undefined at runtime!"),
    "",
    theme.slate("Contrast with unknown:"),
    "  " + badge("unknown", "info") + " " + highlightTs('const resUnk = identityUnknown(user); resUnk.name;') + " → " + theme.slate("Refused: 'resUnk' is of type 'unknown'."),
  ]);
}

export function runRelationshipTour(): string {
  return [runProbe1(), "\n" + runProbe2(), "\n" + runProbe3()].join("\n");
}

export function probeRelationship(value: unknown): string {
  const tag = tagOf(value);
  const genResult = identity(value);
  const anyResult = identityAny(value);
  const unkResult = identityUnknown(value);

  const lines = [
    theme.slate(`Tested Function: identity(x) vs identityAny(x) vs identityUnknown(x)`),
    `Input argument:  ${theme.cyan(formatValue(value))}`,
    `  Inferred T:           ${theme.amber(tag)}`,
    `  generic <T>(x: T): T  → return tag: ${theme.green(genResult.tag)} ` + badge("PRESERVED", "pass"),
    `  any (x: any): any     → return tag: ${theme.amber(anyResult.tag)} ` + badge("ERASED", "collapse"),
    `  unknown (x: unk): unk → return tag: ${theme.cyan(unkResult.tag)} ` + badge("REFUSED", "refused"),
  ];
  return lines.join("\n");
}

export function probeConstraintAt(obj: any, key: any): string {
  const allowedKeys = Object.keys(obj ?? {});
  const isAllowed = allowedKeys.includes(key);

  const lines = [
    theme.slate(`Tested Function: at(obj, key): representing <T, K extends keyof T>(obj: T, key: K): T[K]`),
    `Target object:   ${theme.cyan(formatValue(obj))}`,
    `Allowed keys (keyof T): [${allowedKeys.map((k) => theme.amber(`"${k}"`)).join(", ")}]`,
    `Requested key K: ${theme.cyan(`"${key}"`)}`,
  ];

  if (isAllowed) {
    const val = at(obj, key);
    lines.push(
      "  Entrance Gate:    " + badge("PASS", "pass") + ` ("${key}" satisfies 'K extends keyof T')`,
      "  Internal License: " + badge("GRANTED", "pass") + ` (safe to index obj["${key}"])`,
      `  Result value:     ${theme.green(formatValue(val))} (type: ${typeof val})`,
    );
  } else {
    lines.push(
      "  Entrance Gate:    " + badge("REFUSED", "refused") + ` (TS2345: Argument of type '"${key}"' is not assignable to keyof T)`,
      "  Runtime Guard:    " + badge("BLOCKED", "fail") + ` (RangeError: key '${key}' is not a key of the object)`,
    );
  }
  return lines.join("\n");
}

export function probeConstraintRequire(obj: any, requiredMembers: string[]): string {
  const lines = [
    theme.slate(`Tested Function: requireMembers(value, members): representing <T extends { ${requiredMembers.join(", ")} }>(val: T): T`),
    `Input value:     ${theme.cyan(formatValue(obj))}`,
    `Constraint:      T extends { ${theme.amber(requiredMembers.join(", "))} }`,
  ];
  try {
    requireMembers(obj, requiredMembers);
    lines.push(
      "  Entrance Gate:    " + badge("PASS", "pass") + ` (satisfies required members: [${requiredMembers.join(", ")}])`,
    );
  } catch (err: any) {
    lines.push("  Entrance Gate:    " + badge("REFUSED", "refused") + ` (${err.message})`);
  }
  return lines.join("\n");
}

export function runConstraintsTour(): string {
  const sampleObj = { id: "u1", name: "Ada Lovelace", role: "admin" };

  return card("TypeScript Generics Lab · The Constraint as License and Gate", [
    theme.bold("[Probe 1] Keyed Constraint: at(obj, key) with valid key 'name'"),
    probeConstraintAt(sampleObj, "name"),
    "",
    theme.bold("[Probe 2] Keyed Constraint: at(obj, key) with missing key 'salary'"),
    probeConstraintAt(sampleObj, "salary"),
    "",
    theme.bold("[Probe 3] Entrance Requirement: requireMembers(value, ['id', 'role'])"),
    probeConstraintRequire(sampleObj, ["id", "role"]),
    "",
    theme.bold("[Probe 4] Entrance Requirement: requireMembers(value, ['id', 'department'])"),
    probeConstraintRequire(sampleObj, ["id", "department"]),
  ]);
}

export function runFullTour(): string {
  return [runRelationshipTour(), "\n" + runConstraintsTour()].join("\n");
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

  console.log("\nStarting Stepped Walkthrough: The Relationship Executable (3 Probes)\n");

  console.log(runProbe1());
  await waitForEnter(rl, "\n" + theme.cyan("[Press Enter to proceed to Probe 2/3: Array Element-Type Relationship ➔] "));

  console.log("\n" + runProbe2());
  await waitForEnter(rl, "\n" + theme.cyan("[Press Enter to proceed to Probe 3/3: Object Shape & Downstream Access ➔] "));

  console.log("\n" + runProbe3());
  console.log("\n" + badge("COMPLETE", "pass") + " All 3 probes completed! Type 'deno task lab' or 'npm run lab' for the interactive REPL.\n");
  rl.close();
}

export async function startRepl(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: theme.cyan("lab-generics ❯ "),
  });

  console.log(`\n${theme.cyan(theme.bold("❖ TypeScript Generics Interactive Lab"))} ${theme.dim("(running with Deno)")}`);
  console.log("Type 'probe 1', 'probe 2', or 'probe 3' to run individual probes.");
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
      console.log("  probe 1                      Run Probe 1: Primitive Value (identity vs any vs unknown)");
      console.log("  probe 2                      Run Probe 2: Array Value (element-type preservation)");
      console.log("  probe 3                      Run Probe 3: Object Shape (downstream member access)");
      console.log("  step                         Interactive stepped walkthrough (press Enter between probes)");
      console.log("  tour                         Run full guided walkthrough");
      console.log("  relationship                 Run all 3 relationship probes");
      console.log("  constraints                  Run constraints probe (gate and license)");
      console.log("  compare <json_val>           Compare generic vs any vs unknown on custom value");
      console.log("  get <json_obj> <key>         Probe keyed constraint at(obj, key)");
      console.log("  require <json_obj> <k1,k2>   Probe requireMembers constraint");
      console.log("  exit                         Exit interactive lab\n");
    } else if (cmd === "probe") {
      const num = args[0];
      if (num === "1") console.log("\n" + runProbe1() + "\n");
      else if (num === "2") console.log("\n" + runProbe2() + "\n");
      else if (num === "3") console.log("\n" + runProbe3() + "\n");
      else console.log("Unknown probe number. Choose 'probe 1', 'probe 2', or 'probe 3'.");
    } else if (cmd === "step") {
      await runSteppedSession();
    } else if (cmd === "tour") {
      console.log("\n" + runFullTour() + "\n");
    } else if (cmd === "relationship") {
      console.log("\n" + runRelationshipTour() + "\n");
    } else if (cmd === "constraints") {
      console.log("\n" + runConstraintsTour() + "\n");
    } else if (cmd === "compare") {
      const raw = args.join(" ");
      const val = parseJsonOrRaw(raw);
      console.log("\n" + probeRelationship(val) + "\n");
    } else if (cmd === "get") {
      const key = args.pop();
      const rawObj = args.join(" ");
      const obj = parseJsonOrRaw(rawObj);
      console.log("\n" + probeConstraintAt(obj, key) + "\n");
    } else if (cmd === "require") {
      const keys = (args.pop() || "").split(",").map((s) => s.trim()).filter(Boolean);
      const rawObj = args.join(" ");
      const obj = parseJsonOrRaw(rawObj);
      console.log("\n" + probeConstraintRequire(obj, keys) + "\n");
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
  else console.log("Choose probe 1, 2, or 3");
} else if (firstArg === "--topic=relationship" || firstArg === "relationship") {
  console.log(runRelationshipTour());
} else if (firstArg === "--topic=constraints" || firstArg === "constraints") {
  console.log(runConstraintsTour());
} else if (firstArg === "--tour" || firstArg === "tour") {
  console.log(runFullTour());
} else if (firstArg === "compare") {
  const val = parseJsonOrRaw(args.slice(1).join(" "));
  console.log(probeRelationship(val));
} else if (firstArg === "get") {
  const key = args.at(-1);
  const rawObj = args.slice(1, -1).join(" ");
  console.log(probeConstraintAt(parseJsonOrRaw(rawObj), key));
} else {
  if (process.stdin.isTTY) {
    await startRepl();
  } else {
    console.log(runRelationshipTour());
  }
}
