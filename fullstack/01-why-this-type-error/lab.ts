#!/usr/bin/env -S deno run -A
/**
 * TypeScript Type Error & Assignability Lab
 *
 * Interactive workbench for exploring structural assignability, the fresh-literal
 * excess property check, and the diagnostic error families.
 *
 * Usage:
 *   deno run -A lab.ts            Interactive REPL session (or tour in non-interactive shell)
 *   deno run -A lab.ts --step     Interactive step-by-step walkthrough (pauses between probes)
 *   deno run -A lab.ts probe 1    Run ONLY Probe 1 (Exact Match)
 *   deno run -A lab.ts probe 2    Run ONLY Probe 2 (Missing Member TS2322)
 *   deno run -A lab.ts probe 3    Run ONLY Probe 3 (Variable Reference & Structural Subtyping)
 *   deno run -A lab.ts probe 4    Run ONLY Probe 4 (Fresh Literal Excess Property Check TS2353)
 *   deno run -A lab.ts probe 5    Run ONLY Probe 5 (Diagnostic Error Families)
 *   deno run -A lab.ts assignability Run assignability probes 1-4
 *   deno run -A lab.ts family     Run error diagnostic probe 5
 *   deno run -A lab.ts check <val> <shape> [fresh]
 *   deno run -A lab.ts classify "<error-message>"
 */

import readline from "node:readline";
import { isAssignable, missingMembers } from "./src/assignability.ts";
import { classifyError } from "./src/error_family.ts";

export function formatJson(val: unknown): string {
  return JSON.stringify(val);
}

export function runProbe1(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 1/4] Structural Assignability: Exact Shape Match");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/assignability.ts):");
  out.push("  interface User { id: string; name: string; }");
  out.push("  function isAssignable(value: unknown, shape: Record<string, string>): boolean");

  out.push("\nExecution at Call Site:");
  out.push("  const shape = { id: \"string\", name: \"string\" };");
  out.push("  const value = { id: \"u1\", name: \"Ada Lovelace\" };");
  out.push("  const ok = isAssignable(value, shape);");

  out.push("\nBehind the Scenes in the TypeScript Compiler:");
  out.push("  1. TARGET SHAPE:    Requires members 'id: string' and 'name: string'.");
  out.push("  2. MEMBER CHECK:    'id' present with type string (OK), 'name' present with type string (OK).");
  out.push("  3. MISSING MEMBERS: None. missingMembers(value, shape) -> [].");
  out.push("  4. VERDICT:         ASSIGNABLE (Exact match satisfies shape contract).");
  return out.join("\n");
}

export function runProbe2(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 2/4] Structural Assignability: Missing Required Member");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/assignability.ts):");
  out.push("  interface User { id: string; name: string; }");
  out.push("  const user: User = { id: \"u1\" }; // missing 'name'");

  out.push("\nBehind the Scenes in the TypeScript Compiler:");
  out.push("  1. TARGET SHAPE:    Requires members 'id: string' and 'name: string'.");
  out.push("  2. VALUE PROVIDED:  { id: \"u1\" }");
  out.push("  3. MEMBER CHECK:    'name' was required by User, but is absent on value.");
  out.push("  4. CHECKER REFUSAL: TS2322: Property 'name' is missing in type '{ id: string }' but required in type 'User'.");
  out.push("  5. VERDICT:         REFUSED (Types are requirements: you cannot omit declared members).");
  return out.join("\n");
}

export function runProbe3(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 3/4] Structural Subtyping: Variable Reference with Extra Members");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/assignability.ts):");
  out.push("  interface User { id: string; name: string; }");
  out.push("  const payload = { id: \"u1\", name: \"Ada Lovelace\", admin: true }; // pre-existing variable");
  out.push("  const user: User = payload; // assigning variable to User");

  out.push("\nBehind the Scenes in the TypeScript Compiler:");
  out.push("  1. FRESHNESS CHECK: Is 'payload' a fresh object literal? NO. It is a variable reference.");
  out.push("  2. CHECKER RULE:    Variables are checked for what is MISSING, never what is EXTRA.");
  out.push("  3. MEMBER CHECK:    Does payload have 'id: string'? YES. Does payload have 'name: string'? YES.");
  out.push("  4. EXTRA MEMBERS:   'admin: true' is ignored. The variable has at least the shape User requires.");
  out.push("  5. VERDICT:         ASSIGNABLE (Structural subtyping: values may have more members than target).");
  return out.join("\n");
}

export function runProbe4(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 4/4] Excess Property Check: Fresh Literal with Extra Members");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/assignability.ts):");
  out.push("  interface User { id: string; name: string; }");
  out.push("  const user: User = { id: \"u1\", name: \"Ada Lovelace\", admin: true }; // fresh literal");

  out.push("\nBehind the Scenes in the TypeScript Compiler:");
  out.push("  1. FRESHNESS CHECK: Is the value written directly at the assignment site? YES (Fresh object literal).");
  out.push("  2. GATE TRIGGERED:  Fresh literals trigger the Excess Property Check.");
  out.push("  3. PURPOSE:         Catching typos and obsolete fields before values escape into the program.");
  out.push("  4. CHECKER REFUSAL: TS2353: Object literal may only specify known properties, and 'admin' does not exist in type 'User'.");
  out.push("  5. CONTRAST:        Same object shape as Probe 3, opposite verdict! Freshness decides the check.");
  out.push("  6. SENIOR MOVE:     Either declare 'admin' in User if intentional, or remove it from the literal.");
  return out.join("\n");
}

export function runProbe5(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  Diagnostic Error Families (src/error_family.ts)");
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

export function probeAssignability(value: unknown, shape: Record<string, string>, options: { isFresh?: boolean } = {}): string {
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

export function probeFamily(message: string): string {
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

export function runAssignabilityTour(): string {
  return [runProbe1(), "\n" + runProbe2(), "\n" + runProbe3(), "\n" + runProbe4()].join("\n");
}

export function runFamilyTour(): string {
  return runProbe5();
}

export function runFullTour(): string {
  return [runAssignabilityTour(), "\n" + runFamilyTour()].join("\n");
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

  console.log("\nStarting Stepped Walkthrough: Structural Assignability & Freshness (4 Probes)\n");

  console.log(runProbe1());
  await waitForEnter(rl, "\n[Press Enter to proceed to Probe 2/4: Missing Required Member] ");

  console.log("\n" + runProbe2());
  await waitForEnter(rl, "\n[Press Enter to proceed to Probe 3/4: Variable Reference & Structural Subtyping] ");

  console.log("\n" + runProbe3());
  await waitForEnter(rl, "\n[Press Enter to proceed to Probe 4/4: Fresh Literal Excess Property Check] ");

  console.log("\n" + runProbe4());
  console.log("\nAll 4 assignability probes completed! Type 'deno task lab' or 'npm run lab' for the interactive REPL.\n");
  rl.close();
}

export async function startRepl(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "lab-checker> ",
  });

  console.log("\nTypeScript Type Error & Assignability Interactive Lab (running with Deno)");
  console.log("Type 'probe 1', 'probe 2', 'probe 3', 'probe 4', or 'probe 5' to run individual probes.");
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
      console.log("  probe 1                      Run Probe 1: Exact Shape Match");
      console.log("  probe 2                      Run Probe 2: Missing Required Member TS2322");
      console.log("  probe 3                      Run Probe 3: Variable Structural Subtyping");
      console.log("  probe 4                      Run Probe 4: Fresh Literal Excess Property TS2353");
      console.log("  probe 5                      Run Probe 5: Diagnostic Error Families Matrix");
      console.log("  step                         Interactive stepped walkthrough (press Enter between probes)");
      console.log("  tour                         Run full guided walkthrough");
      console.log("  assignability                Probe structural assignability (probes 1-4)");
      console.log("  family                       Probe the 5 error diagnostic families");
      console.log("  check <val> <shape> [fresh]  Probe assignability of value to shape");
      console.log("  classify <error-message>     Classify error message into diagnostic family");
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

if (firstArg === "--step" || firstArg === "step") {
  await runSteppedSession();
} else if (firstArg === "probe") {
  const num = args[1];
  if (num === "1") console.log(runProbe1());
  else if (num === "2") console.log(runProbe2());
  else if (num === "3") console.log(runProbe3());
  else if (num === "4") console.log(runProbe4());
  else if (num === "5") console.log(runProbe5());
  else console.log("Choose probe 1, 2, 3, 4, or 5");
} else if (firstArg === "--topic=assignability" || firstArg === "assignability") {
  console.log(runAssignabilityTour());
} else if (firstArg === "--topic=family" || firstArg === "family") {
  console.log(runFamilyTour());
} else if (firstArg === "--tour" || firstArg === "tour") {
  console.log(runFullTour());
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
    console.log(runAssignabilityTour());
  }
}
