#!/usr/bin/env -S deno run -A
/**
 * TypeScript Utility Types Lab — Interactive Mapped & Conditional Simulator
 *
 * Interactive workbench for exploring how TypeScript computes types from types:
 *   1. Mapped Types: keyof, [K in keyof T], and indexed access T[K].
 *   2. Conditional Types: member-by-member distribution over unions.
 *   3. Pattern Matching with infer.
 *
 * Usage:
 *   deno run -A lab.ts            Interactive REPL session (or tour in non-interactive shell)
 *   deno run -A lab.ts --step     Interactive step-by-step walkthrough (pauses between probes)
 *   deno run -A lab.ts probe 1    Run ONLY Probe 1 (Partial<T> Mapped Loop)
 *   deno run -A lab.ts probe 2    Run ONLY Probe 2 (Pick<T, K> & Keyed Constraint)
 *   deno run -A lab.ts probe 3    Run ONLY Probe 3 (Omit<T, K> Inverted Pick)
 *   deno run -A lab.ts probe 4    Run ONLY Probe 4 (Distributive Conditional Exclude)
 *   deno run -A lab.ts probe 5    Run ONLY Probe 5 (Pattern Matching with infer)
 *   deno run -A lab.ts machinery  Run all mapped & conditional probes (1-5)
 *   deno run -A lab.ts distribute <u1,u2> <ex>
 *   deno run -A lab.ts mapped <op> <shape> [keys]
 */

import readline from "node:readline";
import {
  keysOf,
  memberOf,
  mapShape,
  myPartial,
  myPick,
  myOmit,
  myRecord,
  describeShape,
  type ShapeDescriptor,
} from "./src/shape_ops.ts";
import {
  arrayOf,
  fnOf,
  myExclude,
  myNonNullable,
  isString,
  matchEach,
  inferElement,
  inferReturn,
} from "./src/conditional_types.ts";
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
  const pipeline = dataFlowPipeline([
    { label: "Query Keys", sub: "keyof User" },
    { label: "Mapped Loop", sub: "[K in keyof T]?" },
    { label: "Indexed Access", sub: "T[K]" },
    { label: "Partial Shape", sub: "All optional" },
  ]);

  return card("[Probe 1/5] Mapped Types: How Partial<T> Rebuilds Shapes", [
    theme.slate("Code Under Test (src/shape_ops.ts):"),
    "  " + highlightTs('type Partial<T> = { [K in keyof T]?: T[K] };'),
    "  " + highlightTs('function myPartial(shape: ShapeDescriptor): ShapeDescriptor;'),
    "",
    theme.slate("Execution at Call Site:"),
    "  " + highlightTs('const User = { id: "string", email: "string", role: "string", age: "number" };'),
    "  " + highlightTs('const result = myPartial(User);'),
    "",
    theme.slate("Dataflow Pipeline:"),
    ...pipeline.split("\n").map((l) => "  " + l),
    "",
    theme.slate("Behind the Scenes in the TypeScript Compiler:"),
    "  " + treeStep("1. QUERY KEYS", theme.amber('keyof User → ["id", "email", "role", "age"]')),
    "  " + treeStep("2. MAPPED LOOP", 'Iterates each member K in keyof T'),
    "  " + treeStep("3. PROPERTY ACCESS", 'T[K] indexes the original property type'),
    "  " + treeStep("4. MODIFIER", theme.green("Appends '?' making each property optional")),
    "  " + treeStep("5. TRANSFORMED TYPE", badge("PASS", "pass") + " " + theme.cyan("{ id?: string; email?: string; role?: string; age?: number }"), true),
  ]);
}

export function runProbe2(): string {
  return card("[Probe 2/5] Mapped Types: Pick<T, K> & The Keyed Constraint", [
    theme.slate("Code Under Test (src/shape_ops.ts):"),
    "  " + highlightTs('type Pick<T, K extends keyof T> = { [P in K]: T[P] };'),
    "  " + highlightTs('function myPick(shape: ShapeDescriptor, keys: string[]): ShapeDescriptor;'),
    "",
    theme.slate("Case A — Valid Pick:"),
    "  " + highlightTs('const result = myPick(User, ["id", "email"]);'),
    "  " + treeStep("Constraint Check", badge("PASS", "pass") + ' ["id", "email"] extends keyof User → VALID'),
    "  " + treeStep("Filtered Shape", theme.cyan("{ id: string; email: string }")),
    "",
    theme.slate("Case B — Key Outside Constraint:"),
    "  " + highlightTs('const invalid = myPick(User, ["id", "salary"]);'),
    "  " + treeStep("Constraint Check", badge("REFUSED", "refused") + theme.rose(" 'salary' does not exist in keyof User!")),
    "  " + treeStep("Compiler Refusal", theme.rose("TS2344: Type '\"salary\"' does not satisfy the constraint 'keyof User'")),
    "  " + treeStep("Runtime Guard", badge("BLOCKED", "fail") + theme.rose(" Throws Error: unknown member: salary"), true),
  ]);
}

export function runProbe3(): string {
  return card("[Probe 3/5] Derived Utilities: Omit<T, K> as Pick Inverted", [
    theme.slate("Code Under Test (src/shape_ops.ts):"),
    "  " + highlightTs('type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;'),
    "  " + highlightTs('function myOmit(shape: ShapeDescriptor, keys: string[]): ShapeDescriptor;'),
    "",
    theme.slate("Execution at Call Site:"),
    "  " + highlightTs('const result = myOmit(User, ["age"]);'),
    "",
    theme.slate("Behind the Scenes in the TypeScript Compiler:"),
    "  " + treeStep("1. FULL KEY SET", 'keyof User → ["id", "email", "role", "age"]'),
    "  " + treeStep("2. EXCLUSION FILTER", theme.amber('Exclude<keyof User, "age"> → ["id", "email", "role"]')),
    "  " + treeStep("3. PICK COMPOSITION", 'Picks only the non-excluded keys'),
    "  " + treeStep("4. TRANSFORMED TYPE", badge("PASS", "pass") + " " + theme.cyan("{ id: string; email: string; role: string }"), true),
  ]);
}

export function runProbe4(): string {
  return card("[Probe 4/5] Conditional Types: Distribution Over Unions", [
    theme.slate("Code Under Test (src/conditional_types.ts):"),
    "  " + highlightTs('type Exclude<T, U> = T extends U ? never : T;'),
    "",
    theme.slate("Execution at Call Site:"),
    "  " + highlightTs('type Action = "click" | "hover" | "scroll";'),
    "  " + highlightTs('type NoHover = Exclude<Action, "hover">;'),
    "",
    theme.slate("Behind the Scenes in the TypeScript Compiler:"),
    "  " + treeStep("1. DISTRIBUTION", 'Naked type parameter "T" distributes across each member:'),
    "     • \"click\" extends \"hover\" ? never : \"click\"   ==>  " + theme.green('"click"'),
    "     • \"hover\" extends \"hover\" ? never : \"hover\"   ==>  " + theme.rose("never"),
    "     • \"scroll\" extends \"hover\" ? never : \"scroll\" ==>  " + theme.green('"scroll"'),
    "  " + treeStep("2. RE-UNIONING", '"click" | never | "scroll"'),
    "  " + treeStep("3. COLLAPSING", "'never' represents empty set and vanishes from unions"),
    "  " + treeStep("4. FINAL TYPE", badge("PASS", "pass") + " " + theme.green('"click" | "scroll"'), true),
  ]);
}

export function runProbe5(): string {
  return card("[Probe 5/5] Pattern Matching: Destructuring Types with infer", [
    theme.slate("Code Under Test (src/conditional_types.ts):"),
    "  " + highlightTs('type ElementOf<T> = T extends (infer E)[] ? E : never;'),
    "  " + highlightTs('type ReturnOf<F>  = F extends (...args: any[]) => infer R ? R : never;'),
    "",
    theme.slate("Pattern 1 — Array Element Unboxing:"),
    "  " + highlightTs('const desc = arrayOf("string"); // representing string[]'),
    "  " + treeStep("Pattern Match", "string[] matches (infer E)[] → binds " + theme.amber("E := string")),
    "  " + treeStep("Extracted Type", badge("PASS", "pass") + " " + theme.cyan("string")),
    "",
    theme.slate("Pattern 2 — Function Return Unboxing:"),
    "  " + highlightTs('const desc = fnOf("Promise<User>"); // representing () => Promise<User>'),
    "  " + treeStep("Pattern Match", "() => Promise<User> matches (...args) => infer R → binds " + theme.amber("R := Promise<User>")),
    "  " + treeStep("Extracted Type", badge("PASS", "pass") + " " + theme.cyan("Promise<User>")),
    "",
    theme.slate("Verdict:"),
    "  " + theme.bold("'infer' is pattern-matching destructuring for the type system."),
  ]);
}

export function runMachineryTour(): string {
  return [runProbe1(), "\n" + runProbe2(), "\n" + runProbe3(), "\n" + runProbe4(), "\n" + runProbe5()].join("\n");
}

export function probeMapped(shape: ShapeDescriptor, op: string, keys: string[] = []): string {
  const allKeys = keysOf(shape);
  const lines = [
    `Input Type Shape: ${describeShape(shape)}`,
    `Extracted keyof T: [${allKeys.map((k) => `"${k}"`).join(", ")}]`,
  ];

  if (op === "partial") {
    const result = myPartial(shape);
    lines.push(
      `Operation: Partial<T> = { [K in keyof T]?: T[K] }`,
      `  Mapped Loop: Iterating each member in keyof T and appending '?' modifier`,
      `  Transformed Shape: ${describeShape(result)}`,
    );
  } else if (op === "pick") {
    lines.push(`Operation: Pick<T, K> = { [P in K]: T[P] } where K extends keyof T`);
    try {
      const result = myPick(shape, keys);
      lines.push(
        `  Constraint Check: ` + badge("PASS", "pass") + ` [${keys.map((k) => `"${k}"`).join(", ")}] extends keyof T → VALID`,
        `  Transformed Shape: ${describeShape(result)}`,
      );
    } catch (err: any) {
      lines.push(
        `  Constraint Check: ` + badge("FAILED", "refused") + ` (${err.message})`,
        `  Refusal: Cannot pick keys that do not exist on the target shape.`,
      );
    }
  } else if (op === "omit") {
    lines.push(`Operation: Omit<T, K> = Pick<T, Exclude<keyof T, K>>`);
    const result = myOmit(shape, keys);
    lines.push(
      `  Excluded Keys: [${keys.map((k) => `"${k}"`).join(", ")}]`,
      `  Remaining Keys: [${keysOf(result).map((k) => `"${k}"`).join(", ")}]`,
      `  Transformed Shape: ${describeShape(result)}`,
    );
  }

  return lines.join("\n");
}

export function probeDistribution(union: string[], excluded: string[]): string {
  const lines = [
    `Input Union:    ${union.join(" | ")}`,
    `Exclusion Set:  ${excluded.join(" | ")}`,
    `Formula:        Exclude<T, U> = T extends U ? never : T`,
    `Step 1 — Distribution (evaluating each union member in isolation):`,
  ];

  const terms: string[] = [];
  for (const member of union) {
    const isExcluded = excluded.includes(member);
    const result = isExcluded ? "never" : `"${member}"`;
    terms.push(result);
    lines.push(
      `  • "${member}" extends ${excluded.map((e) => `"${e}"`).join(" | ")} ? never : "${member}"  ==>  ${result}`,
    );
  }

  const collapsed = myExclude(union, excluded);
  lines.push(
    `Step 2 — Re-union distributed branches:`,
    `  ${terms.join(" | ")}`,
    `Step 3 — Eliminate 'never' (empty set disappears from unions):`,
    `  Result: ` + badge(collapsed.length > 0 ? collapsed.map((c) => `"${c}"`).join(" | ") : "never", "pass"),
  );

  return lines.join("\n");
}

export function probeInfer(typeString: string): string {
  const lines = [`Input Type Description: "${typeString}"`];
  if (typeString.endsWith("[]")) {
    const elemType = typeString.slice(0, -2);
    const desc = arrayOf(elemType);
    const extracted = inferElement(desc);
    lines.push(
      `  Pattern: T extends (infer E)[] ? E : never`,
      `  Extracted Element Type E: ` + badge(extracted, "pass"),
    );
  } else if (typeString.includes("=>")) {
    const returnType = typeString.split("=>")[1].trim();
    const desc = fnOf(returnType);
    const extracted = inferReturn(desc);
    lines.push(
      `  Pattern: F extends (...args: any[]) => infer R ? R : never`,
      `  Extracted Return Type R: ` + badge(extracted, "pass"),
    );
  } else {
    lines.push(`  Pattern did not match: inferred 'never'`);
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

  console.log("\nStarting Stepped Walkthrough: Utility Types & Mapped Machinery (5 Probes)\n");

  console.log(runProbe1());
  await waitForEnter(rl, "\n" + theme.cyan("[Press Enter to proceed to Probe 2/5: Pick<T, K> & Keyed Constraint ➔] "));

  console.log("\n" + runProbe2());
  await waitForEnter(rl, "\n" + theme.cyan("[Press Enter to proceed to Probe 3/5: Omit<T, K> as Inverted Pick ➔] "));

  console.log("\n" + runProbe3());
  await waitForEnter(rl, "\n" + theme.cyan("[Press Enter to proceed to Probe 4/5: Distributive Conditional Exclude ➔] "));

  console.log("\n" + runProbe4());
  await waitForEnter(rl, "\n" + theme.cyan("[Press Enter to proceed to Probe 5/5: Pattern Matching with infer ➔] "));

  console.log("\n" + runProbe5());
  console.log("\n" + badge("COMPLETE", "pass") + " All 5 utility type probes completed! Type 'deno task lab' or 'npm run lab' for the interactive REPL.\n");
  rl.close();
}

export async function startRepl(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: theme.cyan("lab-utilities ❯ "),
  });

  console.log(`\n${theme.cyan(theme.bold("❖ TypeScript Utility Types Interactive Lab"))} ${theme.dim("(running with Deno)")}`);
  console.log("Type 'probe 1', 'probe 2', 'probe 3', 'probe 4', or 'probe 5'.");
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
      console.log("  probe 1                      Run Probe 1: Partial<T> mapped loop");
      console.log("  probe 2                      Run Probe 2: Pick<T, K> and constraint check");
      console.log("  probe 3                      Run Probe 3: Omit<T, K> inverted pick");
      console.log("  probe 4                      Run Probe 4: Distributive conditional Exclude");
      console.log("  probe 5                      Run Probe 5: Type destructuring with infer");
      console.log("  step                         Interactive stepped walkthrough (press Enter between probes)");
      console.log("  tour                         Run full guided walkthrough");
      console.log("  machinery                    Run all mapped & conditional probes (1-5)");
      console.log("  distribute <u1,u2> <ex1,ex2> Probe distributive conditional Exclude");
      console.log("  partial <json_shape>         Run Partial<T> on shape");
      console.log("  pick <json_shape> <k1,k2>    Run Pick<T, K> on shape");
      console.log("  omit <json_shape> <k1,k2>    Run Omit<T, K> on shape");
      console.log("  infer <signature>            Run infer pattern extractor");
      console.log("  exit                         Exit interactive lab\n");
    } else if (cmd === "probe") {
      const num = args[0];
      if (num === "1") console.log("\n" + runProbe1() + "\n");
      else if (num === "2") console.log("\n" + runProbe2() + "\n");
      else if (num === "3") console.log("\n" + runProbe3() + "\n");
      else if (num === "4") console.log("\n" + runProbe4() + "\n");
      else if (num === "5") console.log("\n" + runProbe5() + "\n");
      else console.log("Unknown probe number. Choose 'probe 1' through 'probe 5'.");
    } else if (cmd === "step") {
      await runSteppedSession();
    } else if (cmd === "tour" || cmd === "machinery") {
      console.log("\n" + runMachineryTour() + "\n");
    } else if (cmd === "distribute") {
      const union = (args[0] || "").split(",").map((s) => s.trim()).filter(Boolean);
      const ex = (args[1] || "").split(",").map((s) => s.trim()).filter(Boolean);
      console.log("\n" + probeDistribution(union, ex) + "\n");
    } else if (cmd === "partial") {
      const shape = parseJsonOrRaw(args.join(" "));
      console.log("\n" + probeMapped(shape, "partial") + "\n");
    } else if (cmd === "pick") {
      const keys = (args.pop() || "").split(",").map((s) => s.trim()).filter(Boolean);
      const shape = parseJsonOrRaw(args.join(" "));
      console.log("\n" + probeMapped(shape, "pick", keys) + "\n");
    } else if (cmd === "omit") {
      const keys = (args.pop() || "").split(",").map((s) => s.trim()).filter(Boolean);
      const shape = parseJsonOrRaw(args.join(" "));
      console.log("\n" + probeMapped(shape, "omit", keys) + "\n");
    } else if (cmd === "infer") {
      console.log("\n" + probeInfer(args.join(" ")) + "\n");
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
  else console.log("Choose probe 1 through 5");
} else if (firstArg === "--tour" || firstArg === "tour" || firstArg === "--topic=machinery" || firstArg === "machinery") {
  console.log(runMachineryTour());
} else if (firstArg === "distribute") {
  const u = (args[1] || "").split(",");
  const e = (args[2] || "").split(",");
  console.log(probeDistribution(u, e));
} else {
  if (process.stdin.isTTY) {
    await startRepl();
  } else {
    console.log(runMachineryTour());
  }
}
