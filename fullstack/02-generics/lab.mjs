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
 *   node lab.mjs                 Interactive REPL session (or tour in non-interactive shell)
 *   node lab.mjs --tour          Run full guided tour
 *   node lab.mjs relationship   Run relationship probe
 *   node lab.mjs constraints    Run constraint gate & license probe
 *   node lab.mjs compare <val>   Compare signatures on custom value
 *   node lab.mjs get <obj> <key> Test keyed constraint on object
 */

import readline from "node:readline";
import { identity, identityAny, identityUnknown, tagOf } from "./src/relationship.mjs";
import { at, requireMembers } from "./src/constraints.mjs";

export function formatValue(val) {
  return JSON.stringify(val);
}

export function probeRelationship(value) {
  const tag = tagOf(value);
  const genResult = identity(value);
  const anyResult = identityAny(value);
  const unkResult = identityUnknown(value);

  const lines = [
    `Input value: ${formatValue(value)}`,
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
    `Target object: ${formatValue(obj)}`,
    `Allowed keys (keyof T): [${allowedKeys.map((k) => `"${k}"`).join(", ")}]`,
    `Requested key K: "${key}"`,
  ];

  if (isAllowed) {
    const val = at(obj, key);
    lines.push(
      `  Entrance Gate:    PASS ("${key}" satisfies 'K extends keyof T')`,
      `  Internal License: GRANTED (safe to index obj["${key}"])`,
      `  Result:           ${formatValue(val)} (type: ${typeof val})`,
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
    `Value: ${formatValue(obj)}`,
    `Constraint: T extends { ${requiredMembers.join(", ")} }`,
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

export function runRelationshipTour() {
  const out = [];
  out.push("================================================================================");
  out.push("  TypeScript Generics Lab: The Relationship Executable");
  out.push("================================================================================");
  out.push("\n[Probe 1] Primitive Value (string)");
  out.push(probeRelationship("hello"));

  out.push("\n[Probe 2] Array Value (element relationship preserved)");
  out.push(probeRelationship([1, 2, 3]));

  out.push("\n[Probe 3] Object Shape (downstream member access)");
  out.push(probeRelationship({ id: 101, name: "Ada Lovelace", role: "admin" }));
  out.push("  Downstream access comparison:");
  out.push("    • Generic: accessing .name is checked -> return type string");
  out.push("    • any:     accessing .ghostField passes compiler silently -> runtime undefined!");
  out.push("    • unknown: accessing .name is refused until explicit evidence narrowing");
  return out.join("\n");
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

export async function startRepl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "lab-generics> ",
  });

  console.log("\nTypeScript Generics Interactive Lab");
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
      console.log("  relationship                 Probe relationship with primitives and shapes");
      console.log("  constraints                  Probe constraints (entrance gate & license)");
      console.log("  compare <json_val>           Compare generic vs any vs unknown on value");
      console.log("  get <json_obj> <key>         Probe keyed constraint at(obj, key)");
      console.log("  require <json_obj> <k1,k2>   Probe requireMembers constraint");
      console.log("  exit                         Exit interactive lab\n");
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

if (firstArg === "--tour" || firstArg === "tour") {
  console.log(runFullTour());
} else if (firstArg === "--topic=relationship" || firstArg === "relationship") {
  console.log(runRelationshipTour());
} else if (firstArg === "--topic=constraints" || firstArg === "constraints") {
  console.log(runConstraintsTour());
} else if (firstArg === "compare") {
  const val = parseJsonOrRaw(args.slice(1).join(" "));
  console.log(probeRelationship(val));
} else if (firstArg === "get") {
  const key = args.at(-1);
  const rawObj = args.slice(1, -1).join(" ");
  console.log(probeConstraintAt(parseJsonOrRaw(rawObj), key));
} else {
  // If run in terminal interactively, start REPL; otherwise run tour
  if (process.stdin.isTTY) {
    await startRepl();
  } else {
    console.log(runFullTour());
  }
}
