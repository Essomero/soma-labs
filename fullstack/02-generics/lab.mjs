#!/usr/bin/env node
/**
 * TypeScript Generics Lab — Interactive Relationship & Constraint Simulator
 *
 * A lab exists to drive experiments, not watch tests pass.
 * Here you can probe:
 *   1. The Relationship: why <T>(x: T): T preserves types while any and unknown fail.
 *   2. The Constraint: how K extends keyof T acts as both entrance gate and body license.
 *
 * Usage:
 *   node lab.mjs                  Interactive REPL session (or tour in non-interactive shell)
 *   node lab.mjs --step           Interactive step-by-step walkthrough (pauses between probes)
 *   node lab.mjs probe 1          Run ONLY Probe 1 (Primitive Value)
 *   node lab.mjs probe 2          Run ONLY Probe 2 (Array Element-Type)
 *   node lab.mjs probe 3          Run ONLY Probe 3 (Object Shape & Downstream Access)
 *   node lab.mjs relationship     Run all 3 relationship probes
 *   node lab.mjs constraints      Run constraint gate & license probe
 *   node lab.mjs compare <val>    Compare signatures on custom value
 *   node lab.mjs get <obj> <key>  Test keyed constraint on object
 */

import readline from "node:readline";
import { identity, identityAny, identityUnknown, tagOf } from "./src/relationship.mjs";
import { at, requireMembers } from "./src/constraints.mjs";

export function formatValue(val) {
  return JSON.stringify(val);
}

export function runProbe1() {
  const out = [];
  out.push("================================================================================");
  out.push("  [Probe 1/3] Primitive Value: The Identity Relationship");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/relationship.mjs):");
  out.push("  function identity<T>(value: T): T { return value; }");
  out.push("  function identityAny(value: any): any { return value; }");
  out.push("  function identityUnknown(value: unknown): unknown { return value; }");

  out.push("\nExecution at Call Site:");
  out.push("  const input = \"hello\";");
  out.push("  const result = identity(input);");

  out.push("\nBehind the Scenes in the TypeScript Compiler:");
  out.push("  1. CALL SITE:       identity(\"hello\")");
  out.push("  2. PARAMETER MATCH: Parameter 'value: T' receives argument \"hello\" (type: string)");
  out.push("  3. TYPE INFERENCE:  Compiler observes argument type. Binds type parameter T := string");
  out.push("  4. RETURN BINDING:  Declared return type is 'T'. Since T = string, return type := string");
  out.push("  5. DOWNSTREAM:      const result: string = identity(\"hello\");");
  out.push("                      result.toUpperCase() is VALID and checked.");
  out.push("                      result.toFixed()     is REFUSED (TS2339: does not exist on type 'string')");

  out.push("\nContrast with the Alternatives:");
  out.push("  • identityAny(\"hello\"):");
  out.push("    - Parameter 'value: any' disables type checking.");
  out.push("    - Return type: 'any' (type relationship erased).");
  out.push("    - Hazard: resultAny.nonExistent() compiles with ZERO errors, crashes at runtime!");

  out.push("  • identityUnknown(\"hello\"):");
  out.push("    - Parameter 'value: unknown' safely accepts any type.");
  out.push("    - Return type: 'unknown' (compiler refuses to commit to what was passed).");
  out.push("    - Blocker: Calling resultUnknown.toUpperCase() is REFUSED (TS18046) until manual cast.");

  out.push("\nVerdict:");
  out.push("  The generic is the only annotation where the return type is a function of the argument type.");
  return out.join("\n");
}

export function runProbe2() {
  const out = [];
  out.push("================================================================================");
  out.push("  [Probe 2/3] Array Value: Element-Type Relationship");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/relationship.mjs):");
  out.push("  function identity<T>(value: T): T { return value; }");
  out.push("  function first<T>(arr: T[]): T | undefined { return arr[0]; }");

  out.push("\nExecution at Call Site:");
  out.push("  const numbers = [1, 2, 3];");
  out.push("  const result = identity(numbers);");

  out.push("\nBehind the Scenes in the TypeScript Compiler:");
  out.push("  1. CALL SITE:       identity([1, 2, 3])");
  out.push("  2. ELEMENT CHECK:   Compiler inspects array elements (all numbers) -> type is number[]");
  out.push("  3. TYPE INFERENCE:  Binds T := number[] (preserves element type, does NOT collapse to 'object' or 'any[]')");
  out.push("  4. RETURN BINDING:  Returns number[] intact.");
  out.push("  5. EXTENSION (first<T>):");
  out.push("     Calling first(numbers) matches 'arr: T[]' against 'number[]' -> infers T := number.");
  out.push("     The return type 'T | undefined' resolves to 'number | undefined'.");

  out.push("\nVerdict:");
  out.push("  Generics propagate nested element types across collections without losing shape precision.");
  return out.join("\n");
}

export function runProbe3() {
  const out = [];
  out.push("================================================================================");
  out.push("  [Probe 3/3] Object Shape: Downstream Property Access");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/relationship.mjs):");
  out.push("  interface User { id: number; name: string; role: string; }");
  out.push("  const user: User = { id: 101, name: \"Ada Lovelace\", role: \"admin\" };");
  out.push("  const result = identity(user);");

  out.push("\nBehind the Scenes in the TypeScript Compiler:");
  out.push("  1. CALL SITE:       identity(user)");
  out.push("  2. TYPE INFERENCE:  Binds T := User ({ id: number; name: string; role: string })");
  out.push("  3. RETURN BINDING:  result has type User.");
  out.push("  4. DOWNSTREAM ACCESS CHECKS:");
  out.push("     • result.name:       Property exists on T (type string) -> ALLOWED (value: \"Ada Lovelace\")");
  out.push("     • result.ghostField: Property does NOT exist on T!");
  out.push("                          Compiler REFUSES before build: TS2339 Property 'ghostField' does not exist on type 'User'");

  out.push("\nContrast with any:");
  out.push("  const resAny = identityAny(user);");
  out.push("  resAny.ghostField;  // Compiler says OK -> At runtime evaluates to undefined (silent bug!)");

  out.push("\nContrast with unknown:");
  out.push("  const resUnk = identityUnknown(user);");
  out.push("  resUnk.name;        // Compiler REFUSES: 'resUnk' is of type 'unknown'. Requires (resUnk as User).name");
  return out.join("\n");
}

export function runRelationshipTour() {
  return [runProbe1(), "\n" + runProbe2(), "\n" + runProbe3()].join("\n");
}

export function probeRelationship(value) {
  const tag = tagOf(value);
  const genResult = identity(value);
  const anyResult = identityAny(value);
  const unkResult = identityUnknown(value);

  const lines = [
    `Tested Function: identity(x) vs identityAny(x) vs identityUnknown(x)`,
    `Input argument:  ${formatValue(value)}`,
    `  Inferred T:           ${tag}`,
    `  generic <T>(x: T): T  -> return tag: ${genResult.tag} (relationship preserved)`,
    `  any (x: any): any     -> return tag: ${anyResult.tag} (relationship erased; checker blind)`,
    `  unknown (x: unk): unk -> return tag: ${unkResult.tag} (relationship refused; manual cast required)`,
  ];
  return lines.join("\n");
}

export function probeConstraintAt(obj, key) {
  const allowedKeys = Object.keys(obj ?? {});
  const isAllowed = allowedKeys.includes(key);

  const lines = [
    `Tested Function: at(obj, key): representing <T, K extends keyof T>(obj: T, key: K): T[K]`,
    `Target object:   ${formatValue(obj)}`,
    `Allowed keys (keyof T): [${allowedKeys.map((k) => `"${k}"`).join(", ")}]`,
    `Requested key K: "${key}"`,
  ];

  if (isAllowed) {
    const val = at(obj, key);
    lines.push(
      `  Entrance Gate:    PASS ("${key}" satisfies 'K extends keyof T')`,
      `  Internal License: GRANTED (safe to index obj["${key}"])`,
      `  Result value:     ${formatValue(val)} (type: ${typeof val})`,
    );
  } else {
    lines.push(
      `  Entrance Gate:    REFUSED (TS2345: Argument of type '"${key}"' is not assignable to keyof T)`,
      `  Runtime Guard:    Blocked before access (RangeError: key '${key}' is not a key of the object)`,
    );
  }
  return lines.join("\n");
}

export function probeConstraintRequire(obj, requiredMembers) {
  const lines = [
    `Tested Function: requireMembers(value, members): representing <T extends { ${requiredMembers.join(", ")} }>(val: T): T`,
    `Input value:     ${formatValue(obj)}`,
    `Constraint:      T extends { ${requiredMembers.join(", ")} }`,
  ];
  try {
    requireMembers(obj, requiredMembers);
    lines.push(
      `  Entrance Gate:    PASS (satisfies required members: [${requiredMembers.join(", ")}])`,
    );
  } catch (err) {
    lines.push(`  Entrance Gate:    REFUSED (${err.message})`);
  }
  return lines.join("\n");
}

export function runConstraintsTour() {
  const out = [];
  out.push("================================================================================");
  out.push("  TypeScript Generics Lab: The Constraint as License and Gate");
  out.push("================================================================================");
  const sampleObj = { id: "u1", name: "Ada Lovelace", role: "admin" };

  out.push("\n[Probe 1] Keyed Constraint: at(obj, key) with valid key 'name'");
  out.push(probeConstraintAt(sampleObj, "name"));

  out.push("\n[Probe 2] Keyed Constraint: at(obj, key) with missing key 'salary'");
  out.push(probeConstraintAt(sampleObj, "salary"));

  out.push("\n[Probe 3] Entrance Requirement: requireMembers(value, ['id', 'role'])");
  out.push(probeConstraintRequire(sampleObj, ["id", "role"]));

  out.push("\n[Probe 4] Entrance Requirement: requireMembers(value, ['id', 'department'])");
  out.push(probeConstraintRequire(sampleObj, ["id", "department"]));
  return out.join("\n");
}

export function runFullTour() {
  return [runRelationshipTour(), "\n" + runConstraintsTour()].join("\n");
}

function parseJsonOrRaw(input) {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

async function waitForEnter(rl, promptText) {
  return new Promise((resolve) => {
    rl.question(promptText, () => resolve());
  });
}

export async function runSteppedSession() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\nStarting Stepped Walkthrough: The Relationship Executable (3 Probes)\n");

  console.log(runProbe1());
  await waitForEnter(rl, "\n[Press Enter to proceed to Probe 2/3: Array Element-Type Relationship] ");

  console.log("\n" + runProbe2());
  await waitForEnter(rl, "\n[Press Enter to proceed to Probe 3/3: Object Shape & Downstream Access] ");

  console.log("\n" + runProbe3());
  console.log("\nAll 3 probes completed! Type 'npm run lab' for the interactive REPL.\n");
  rl.close();
}

export async function startRepl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "lab-generics> ",
  });

  console.log("\nTypeScript Generics Interactive Lab");
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
