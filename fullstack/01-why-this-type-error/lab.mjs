#!/usr/bin/env node
/**
 * TypeScript Type Error & Assignability Lab
 *
 * Interactive workbench for exploring structural assignability, the fresh-literal
 * excess property check, and the five diagnostic error families.
 *
 * Usage:
 *   node lab.mjs                  Interactive REPL session (or tour in non-interactive shell)
 *   node lab.mjs --tour           Run full guided tour
 *   node lab.mjs assignability    Run assignability & excess property probe
 *   node lab.mjs family           Run error family diagnostic probe
 *   node lab.mjs check <val> <shape> [fresh]
 *   node lab.mjs classify "<error-message>"
 */

import readline from "node:readline";
import { isAssignable, missingMembers } from "./src/assignability.mjs";
import { classifyError } from "./src/error_family.mjs";

export function formatJson(val) {
  return JSON.stringify(val);
}

export function probeAssignability(value, shape, options = {}) {
  const isFresh = options.isFresh ?? false;
  const missing = missingMembers(value, shape);
  const extraKeys =
    value && typeof value === "object"
      ? Object.keys(value).filter((k) => !Object.prototype.hasOwnProperty.call(shape, k))
      : [];

  const lines = [
    `Target Shape: ${formatJson(shape)}`,
    `Input Value:  ${formatJson(value)}`,
    `Freshness:    ${isFresh ? "Fresh object literal (declared at assignment site)" : "Variable reference (pre-existing variable)"}`,
  ];

  if (missing.length > 0) {
    lines.push(
      `  Required Member Check: FAILED`,
      `  Missing or incompatible: [${missing.map((m) => `"${m}"`).join(", ")}]`,
      `  Checker Verdict: REFUSED (TS2322: Type does not satisfy target shape)`,
    );
    return lines.join("\n");
  }

  lines.push(`  Required Member Check: PASSED (all required members present with valid types)`);

  if (extraKeys.length > 0) {
    lines.push(`  Extra Members Detected: [${extraKeys.map((k) => `"${k}"`).join(", ")}]`);
    if (isFresh) {
      lines.push(
        `  Excess Property Check: TRIGGERED`,
        `  Checker Verdict: REFUSED (TS2353: Object literal may only specify known properties, and '${extraKeys[0]}' does not exist in target shape)`,
        `  Explanation: Fresh literals trigger excess property checks to catch typos before values escape.`,
      );
    } else {
      lines.push(
        `  Excess Property Check: SKIPPED (variable references are checked structurally)`,
        `  Checker Verdict: ASSIGNABLE (structural subtyping: extra members on variables are permitted)`,
      );
    }
  } else {
    lines.push(`  Checker Verdict: ASSIGNABLE (exact shape match)`);
  }

  return lines.join("\n");
}

export function probeFamily(message) {
  const family = classifyError(message);
  const details = {
    "missing-or-incompatible": {
      code: "TS2322 / TS2345",
      claim: "Target expects a property or type that the source value does not provide.",
      naiveTrap: "Casting with 'as' or silencing with 'any' — discards the type error and ships broken data.",
      seniorFix: "Inspect which member diverged, then fix the data or widen the target interface if genuinely intended.",
    },
    "excess-property": {
      code: "TS2353",
      claim: "Fresh literal specifies a property not declared in the target shape.",
      naiveTrap: "Disabling excess checks by adding '[key: string]: any' index signature to the interface.",
      seniorFix: "Either declare the property on the interface or remove the excess field from the literal.",
    },
    "possibly-undefined": {
      code: "TS2532",
      claim: "Attempting to dereference a property on a value that may be undefined or null.",
      naiveTrap: "Non-null assertion 'value!.prop' — turns off the check and causes runtime TypeError if absent.",
      seniorFix: "Provide explicit evidence: optional chaining 'value?.prop' or an if-guard 'if (value)'.",
    },
    "union-no-common-member": {
      code: "TS2339",
      claim: "Property exists on some union variants, but not on all of them.",
      naiveTrap: "Casting to one specific variant '(item as VariantA).prop' without runtime check.",
      seniorFix: "Narrow by discriminant first: 'if (item.kind === \"a\") item.prop'.",
    },
  }[family] ?? {
    code: "Unknown",
    claim: "Unrecognized checker message pattern.",
    naiveTrap: "Ignoring the error.",
    seniorFix: "Read the target and source types.",
  };

  const lines = [
    `Message: "${message}"`,
    `  Error Family: ${family} (${details.code})`,
    `  Checker Claim: ${details.claim}`,
    `  Naive Trap:    ${details.naiveTrap}`,
    `  Senior Fix:    ${details.seniorFix}`,
  ];
  return lines.join("\n");
}

export function runAssignabilityTour() {
  const out = [];
  out.push("================================================================================");
  out.push("  TypeScript Checker Lab: Structural Assignability & Freshness");
  out.push("================================================================================");
  const userShape = { id: "string", name: "string" };

  out.push("\n[Scenario 1] Exact Match");
  out.push(probeAssignability({ id: "u1", name: "Ada Lovelace" }, userShape));

  out.push("\n[Scenario 2] Missing Required Member ('name')");
  out.push(probeAssignability({ id: "u1" }, userShape));

  out.push("\n[Scenario 3] Variable with Extra Member ('admin') — Structural Subtyping");
  out.push(
    probeAssignability({ id: "u1", name: "Ada Lovelace", admin: true }, userShape, {
      isFresh: false,
    }),
  );

  out.push("\n[Scenario 4] Fresh Literal with Extra Member ('admin') — Excess Property Check");
  out.push(
    probeAssignability({ id: "u1", name: "Ada Lovelace", admin: true }, userShape, {
      isFresh: true,
    }),
  );

  return out.join("\n");
}

export function runFamilyTour() {
  const out = [];
  out.push("================================================================================");
  out.push("  TypeScript Checker Lab: Diagnostic Error Families");
  out.push("================================================================================");

  out.push("\n[Diagnostic 1] Base Assignability Mismatch");
  out.push(probeFamily("Type 'number' is not assignable to type 'string'."));

  out.push("\n[Diagnostic 2] Fresh Literal Excess Property");
  out.push(
    probeFamily(
      "Type '{ id: string; admin: true; }' may only specify known properties, and 'admin' does not exist in type 'User'.",
    ),
  );

  out.push("\n[Diagnostic 3] Possibly Undefined Dereference");
  out.push(probeFamily("Object is possibly 'undefined'."));

  out.push("\n[Diagnostic 4] Union Member Access without Narrowing");
  out.push(probeFamily("Property 'radius' does not exist on type 'Circle | Square'."));

  return out.join("\n");
}

export function runFullTour() {
  return [runAssignabilityTour(), "\n" + runFamilyTour()].join("\n");
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
    prompt: "lab-checker> ",
  });

  console.log("\nTypeScript Type Error & Assignability Interactive Lab");
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
      console.log("  assignability                Probe structural assignability & freshness");
      console.log("  family                       Probe the 5 error diagnostic families");
      console.log("  check <val> <shape> [fresh]  Probe assignability of value to shape");
      console.log("  classify <error-message>     Classify error message into diagnostic family");
      console.log("  exit                         Exit interactive lab\n");
    } else if (cmd === "tour") {
      console.log("\n" + runFullTour() + "\n");
    } else if (cmd === "assignability") {
      console.log("\n" + runAssignabilityTour() + "\n");
    } else if (cmd === "family") {
      console.log("\n" + runFamilyTour() + "\n");
    } else if (cmd === "check") {
      const isFresh = args.at(-1) === "fresh" || args.at(-1) === "true";
      const cleanArgs = isFresh ? args.slice(0, -1) : args;
      const val = parseJsonOrRaw(cleanArgs[0]);
      const shape = parseJsonOrRaw(cleanArgs[1]);
      console.log("\n" + probeAssignability(val, shape, { isFresh }) + "\n");
    } else if (cmd === "classify") {
      const msg = args.join(" ").replace(/^["']|["']$/g, "");
      console.log("\n" + probeFamily(msg) + "\n");
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
} else if (firstArg === "--topic=assignability" || firstArg === "assignability") {
  console.log(runAssignabilityTour());
} else if (firstArg === "--topic=family" || firstArg === "family") {
  console.log(runFamilyTour());
} else if (firstArg === "check") {
  const isFresh = args.includes("fresh") || args.includes("true");
  const filtered = args.slice(1).filter((a) => a !== "fresh" && a !== "true");
  console.log(
    probeAssignability(parseJsonOrRaw(filtered[0]), parseJsonOrRaw(filtered[1]), { isFresh }),
  );
} else if (firstArg === "classify") {
  console.log(probeFamily(args.slice(1).join(" ")));
} else {
  if (process.stdin.isTTY) {
    await startRepl();
  } else {
    console.log(runFullTour());
  }
}
