#!/usr/bin/env node
/**
 * TypeScript Utility Types Lab — Interactive Mapped & Conditional Simulator
 *
 * Interactive workbench for exploring how TypeScript computes types from types:
 *   1. Mapped Types: keyof, [K in keyof T], and indexed access T[K].
 *   2. Conditional Types: member-by-member distribution over unions.
 *   3. Pattern Matching with infer.
 *
 * Usage:
 *   node lab.mjs                  Interactive REPL session (or tour in non-interactive shell)
 *   node lab.mjs --tour           Run full guided tour
 *   node lab.mjs machinery        Run mapped & conditional type machinery probe
 *   node lab.mjs distribute <u1,u2> <ex>
 *   node lab.mjs mapped <op> <shape> [keys]
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
} from "./src/shape_ops.mjs";
import {
  arrayOf,
  fnOf,
  myExclude,
  myNonNullable,
  isString,
  matchEach,
  inferElement,
  inferReturn,
} from "./src/conditional_types.mjs";

export function formatJson(val) {
  return JSON.stringify(val);
}

export function probeMapped(shape, op, keys = []) {
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
        `  Constraint Check: [${keys.map((k) => `"${k}"`).join(", ")}] extends keyof T -> VALID`,
        `  Transformed Shape: ${describeShape(result)}`,
      );
    } catch (err) {
      lines.push(
        `  Constraint Check: FAILED (${err.message})`,
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

export function probeDistribution(union, excluded) {
  const lines = [
    `Input Union:    ${union.join(" | ")}`,
    `Exclusion Set:  ${excluded.join(" | ")}`,
    `Formula:        Exclude<T, U> = T extends U ? never : T`,
    `Step 1 — Distribution (evaluating each union member in isolation):`,
  ];

  const terms = [];
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
    `  Result: ${collapsed.length > 0 ? collapsed.map((c) => `"${c}"`).join(" | ") : "never"}`,
  );

  return lines.join("\n");
}

export function probeInfer(typeString) {
  const lines = [`Input Type Description: "${typeString}"`];
  if (typeString.endsWith("[]")) {
    const elemType = typeString.slice(0, -2);
    const desc = arrayOf(elemType);
    const extracted = inferElement(desc);
    lines.push(
      `  Pattern: T extends (infer E)[] ? E : never`,
      `  Extracted Element Type E: ${extracted}`,
    );
  } else if (typeString.includes("=>")) {
    const returnType = typeString.split("=>")[1].trim();
    const desc = fnOf(returnType);
    const extracted = inferReturn(desc);
    lines.push(
      `  Pattern: F extends (...args: any[]) => infer R ? R : never`,
      `  Extracted Return Type R: ${extracted}`,
    );
  } else {
    lines.push(`  Pattern did not match: inferred 'never'`);
  }
  return lines.join("\n");
}

export function runMachineryTour() {
  const out = [];
  out.push("================================================================================");
  out.push("  TypeScript Utility Types Lab: Mapped & Conditional Machinery");
  out.push("================================================================================");

  const userType = { id: "string", email: "string", role: "string", age: "number" };

  out.push("\n[Transform 1] Partial<User>");
  out.push(probeMapped(userType, "partial"));

  out.push("\n[Transform 2] Pick<User, 'id' | 'email'>");
  out.push(probeMapped(userType, "pick", ["id", "email"]));

  out.push("\n[Transform 3] Pick<User, 'id' | 'salary'> (Constraint Violation)");
  out.push(probeMapped(userType, "pick", ["id", "salary"]));

  out.push("\n[Transform 4] Omit<User, 'age'>");
  out.push(probeMapped(userType, "omit", ["age"]));

  out.push("\n[Transform 5] Distributive Conditional Type: Exclude<'click' | 'hover' | 'scroll', 'hover'>");
  out.push(probeDistribution(["click", "hover", "scroll"], ["hover"]));

  out.push("\n[Transform 6] Type Destructuring with infer");
  out.push(probeInfer("() => Promise<User>"));
  out.push(probeInfer("string[]"));

  return out.join("\n");
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
    prompt: "lab-utilities> ",
  });

  console.log("\nTypeScript Utility Types Interactive Lab");
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
      console.log("  machinery                    Probe mapped types, distribution, and infer");
      console.log("  distribute <u1,u2> <ex1,ex2> Probe distributive conditional Exclude");
      console.log("  partial <json_shape>         Run Partial<T> on shape");
      console.log("  pick <json_shape> <k1,k2>    Run Pick<T, K> on shape");
      console.log("  omit <json_shape> <k1,k2>    Run Omit<T, K> on shape");
      console.log("  infer <signature>            Run infer pattern extractor");
      console.log("  exit                         Exit interactive lab\n");
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

if (firstArg === "--tour" || firstArg === "tour" || firstArg === "--topic=machinery" || firstArg === "machinery") {
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
