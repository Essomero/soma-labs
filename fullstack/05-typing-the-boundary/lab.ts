#!/usr/bin/env -S deno run -A
/**
 * TypeScript Trust Boundary Lab — Cast vs Schema Validation Simulator
 *
 * Interactive workbench for exploring the runtime trust boundary:
 *   1. Door A: The Type Cast (`as User`) — why casting is not validation and leads to production runtime crashes.
 *   2. Door B: The Schema Gate (`safeParse`) — parse, don't validate at the system boundary.
 *   3. Schema Drift: Catching when external API payloads drift from internal contracts.
 *
 * Usage:
 *   deno run -A lab.ts            Interactive REPL session (or tour in non-interactive shell)
 *   deno run -A lab.ts --step     Interactive step-by-step walkthrough (pauses between probes)
 *   deno run -A lab.ts probe 1    Run ONLY Probe 1 (Valid Untrusted Payload)
 *   deno run -A lab.ts probe 2    Run ONLY Probe 2 (Missing Required Field: Runtime Crash vs Gate Catch)
 *   deno run -A lab.ts probe 3    Run ONLY Probe 3 (Incompatible Type: Type Lie vs Schema Catch)
 *   deno run -A lab.ts probe 4    Run ONLY Probe 4 (API Schema Drift Detection)
 *   deno run -A lab.ts boundary   Run trust boundary comparison probes (1-4)
 *   deno run -A lab.ts test <raw_json> Test raw JSON through both doors
 */

import readline from "node:readline";
import {
  userSchema,
  safeParse,
  describe,
  object,
  string,
  number,
  boolean,
  enumeration,
  array,
  type Schema,
} from "./src/schema.ts";
import { readJson, decode } from "./src/boundary.ts";

export function formatJson(val: unknown): string {
  return JSON.stringify(val);
}

export function runProbe1(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 1/4] Trust Boundary: Valid Untrusted Payload");
  out.push("================================================================================");
  out.push("\nCode Under Test (src/schema.ts & src/boundary.ts):");
  out.push("  const userSchema = object({ id: string(), name: string(), email: string(), role: enumeration([\"admin\", \"member\"]) });");
  out.push("  function safeParse(schema, value);");

  out.push("\nRaw Input:");
  out.push("  '{\"id\":\"u-101\",\"name\":\"Ada Lovelace\",\"email\":\"ada@analytical.engine\",\"role\":\"admin\"}'");

  out.push("\nComparison:");
  out.push("  • Door A (as User):    Compiles with 0 warnings. user.email.toLowerCase() succeeds.");
  out.push("  • Door B (safeParse):  Validates shape at boundary. Returns verified typed data.");
  out.push("  • Danger:              Door A succeeded only by luck! If the upstream API omitted 'email', Door A would crash.");
  return out.join("\n");
}

export function runProbe2(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 2/4] Missing Required Field: The Type Cast Crash");
  out.push("================================================================================");
  out.push("\nCode Under Test:");
  out.push("  // Door A — The Type Assertion:");
  out.push("  const raw = await res.json();");
  out.push("  const user = raw as User; // Lie to the compiler: 'trust me'");
  out.push("  console.log(user.email.toLowerCase());");

  out.push("\nExecution with payload missing 'email' ('{\"id\":\"u-102\",\"name\":\"Charles Babbage\",\"role\":\"member\"}'):");
  out.push("  • COMPILER CHECK:   BYPASSED. The 'as User' cast shuts off all compiler errors.");
  out.push("  • COMPILE ERROR:    NONE (compiles cleanly).");
  out.push("  • RUNTIME CRASH:    TypeError: Cannot read properties of undefined (reading 'toLowerCase')");
  out.push("  • OUTCOME:          PRODUCTION OUTAGE. The type cast made a promise the runtime never kept.");

  out.push("\nDoor B — The Schema Gate:");
  out.push("  const result = userSchema.safeParse(raw);");
  out.push("  • BOUNDARY CHECK:   REJECTED BEFORE BUSINESS LOGIC");
  out.push("  • ISSUE PATH:       [\"email\"]");
  out.push("  • REASON:           email: expected string");
  out.push("  • CRASH PREVENTED:  YES. Application returns HTTP 400 or handles missing field gracefully.");
  return out.join("\n");
}

export function runProbe3(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 3/4] Incompatible Field Type: Corrupt Payload");
  out.push("================================================================================");
  out.push("\nExecution with corrupted payload ('{\"id\":\"u-103\",\"name\":\"Corrupt Row\",\"email\":12345,\"role\":\"member\"}'):");
  out.push("  • Door A (as User): Compiler believes 'email' is string.");
  out.push("                      Runtime execution user.email.toLowerCase() throws:");
  out.push("                      TypeError: user.email.toLowerCase is not a function (received number)");
  out.push("  • Door B (safeParse): Caught at boundary. Error: email: expected string at path ['email'].");
  return out.join("\n");
}

export function runProbe4(): string {
  const out: string[] = [];
  out.push("================================================================================");
  out.push("  [Probe 4/4] API Drift: Renamed Backend Field");
  out.push("================================================================================");
  out.push("\nExecution with drifted payload ('{\"id\":\"u-104\",\"name\":\"Drifted API\",\"email_address\":\"drift@api.dev\",\"role\":\"member\"}'):");
  out.push("  • The Problem:   Backend renamed 'email' to 'email_address'.");
  out.push("  • Door A Impact: Downstream code expects 'user.email' and gets undefined.");
  out.push("  • Door B Gate:   safeParse immediately fails on missing 'email', surfacing contract drift in staging.");
  return out.join("\n");
}

export function runBoundaryTour(): string {
  return [runProbe1(), "\n" + runProbe2(), "\n" + runProbe3(), "\n" + runProbe4()].join("\n");
}

export function probeBoundaryDoors(rawInput: unknown, schema: Schema<any> = userSchema): string {
  const lines = [
    `Contract Schema: ${describe(schema)}`,
    `Raw Input:       ${typeof rawInput === "string" ? rawInput : formatJson(rawInput)}`,
  ];

  const parsedJson = typeof rawInput === "string" ? readJson(rawInput) : { ok: true, value: rawInput };

  if (!parsedJson.ok) {
    lines.push(
      `\n[JSON Parse Check] FAILED (malformed JSON text: ${parsedJson.message})`,
      `Both doors reject malformed syntax.`,
    );
    return lines.join("\n");
  }

  const payload = parsedJson.value as any;

  lines.push(`\n--------------------------------------------------------------------------------`);
  lines.push(`[DOOR A] The Cast: (payload as User)`);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`  Compiler Check:   BYPASSED ('as' instructs compiler to disable checking)`);
  lines.push(`  Compile Error:    NONE (compiles cleanly)`);
  lines.push(`  Runtime Check:    NONE (the assertion is erased at compile time)`);

  try {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("Cannot read properties of primitive (reading 'email')");
    }
    if (payload.email === undefined) {
      throw new TypeError("Cannot read properties of undefined (reading 'toLowerCase')");
    }
    if (typeof payload.email !== "string") {
      throw new TypeError(`payload.email.toLowerCase is not a function (received ${typeof payload.email})`);
    }
    lines.push(
      `  Downstream Code:  user.email.toLowerCase() -> "${payload.email.toLowerCase()}"`,
      `  Execution Status: SUCCESS (payload happened to meet expectations)`,
    );
  } catch (err: any) {
    lines.push(
      `  Downstream Code:  user.email.toLowerCase()`,
      `  RUNTIME CRASH:    ${err.name}: ${err.message}`,
      `  Verdict:          PRODUCTION OUTAGE. A type cast is a promise the runtime never made.`,
    );
  }

  lines.push(`\n--------------------------------------------------------------------------------`);
  lines.push(`[DOOR B] The Schema Gate: schema.safeParse(payload)`);
  lines.push(`--------------------------------------------------------------------------------`);
  const result = safeParse(schema, payload);

  if (result.success) {
    lines.push(
      `  Schema Gate:      PASSED`,
      `  Validated Data:   ${formatJson(result.data)}`,
      `  Downstream Code:  user.email.toLowerCase() -> "${result.data.email.toLowerCase()}"`,
      `  Guaranteed Type:  Downstream code only receives verified data with non-null members.`,
    );
  } else {
    lines.push(
      `  Schema Gate:      REJECTED AT THE BOUNDARY`,
      `  Error Path:       [${result.error.path.map((p) => `"${p}"`).join(", ")}]`,
      `  Error Message:    ${result.error.message}`,
      `  Crash Prevented:  YES (caught before reaching business logic)`,
      `  Graceful Action:  Return HTTP 400 or render fallback error screen.`,
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

  console.log("\nStarting Stepped Walkthrough: The Trust Boundary (4 Probes)\n");

  console.log(runProbe1());
  await waitForEnter(rl, "\n[Press Enter to proceed to Probe 2/4: Missing Required Field Crash] ");

  console.log("\n" + runProbe2());
  await waitForEnter(rl, "\n[Press Enter to proceed to Probe 3/4: Incompatible Field Type] ");

  console.log("\n" + runProbe3());
  await waitForEnter(rl, "\n[Press Enter to proceed to Probe 4/4: API Schema Drift Detection] ");

  console.log("\n" + runProbe4());
  console.log("\nAll 4 trust boundary probes completed! Type 'deno task lab' or 'npm run lab' for the interactive REPL.\n");
  rl.close();
}

export async function startRepl(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "lab-boundary> ",
  });

  console.log("\nTypeScript Trust Boundary Interactive Lab (running with Deno)");
  console.log("Type 'probe 1', 'probe 2', 'probe 3', or 'probe 4'.");
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
      console.log("  probe 1                      Run Probe 1: Valid Untrusted Payload");
      console.log("  probe 2                      Run Probe 2: Missing Required Field (Crash vs Gate)");
      console.log("  probe 3                      Run Probe 3: Incompatible Type (Type Lie vs Gate)");
      console.log("  probe 4                      Run Probe 4: API Schema Drift Detection");
      console.log("  step                         Interactive stepped walkthrough (press Enter between probes)");
      console.log("  tour                         Run full guided walkthrough");
      console.log("  boundary                     Run trust boundary comparison probes (1-4)");
      console.log("  test <raw_json>              Test raw payload through Door A and Door B");
      console.log("  exit                         Exit interactive lab\n");
    } else if (cmd === "probe") {
      const num = args[0];
      if (num === "1") console.log("\n" + runProbe1() + "\n");
      else if (num === "2") console.log("\n" + runProbe2() + "\n");
      else if (num === "3") console.log("\n" + runProbe3() + "\n");
      else if (num === "4") console.log("\n" + runProbe4() + "\n");
      else console.log("Unknown probe number. Choose 'probe 1' through 'probe 4'.");
    } else if (cmd === "step") {
      await runSteppedSession();
    } else if (cmd === "tour" || cmd === "boundary") {
      console.log("\n" + runBoundaryTour() + "\n");
    } else if (cmd === "test") {
      console.log("\n" + probeBoundaryDoors(args.join(" ")) + "\n");
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
  else console.log("Choose probe 1 through 4");
} else if (firstArg === "--tour" || firstArg === "tour" || firstArg === "--topic=boundary" || firstArg === "boundary") {
  console.log(runBoundaryTour());
} else if (firstArg === "test") {
  console.log(probeBoundaryDoors(args.slice(1).join(" ")));
} else {
  if (process.stdin.isTTY) {
    await startRepl();
  } else {
    console.log(runBoundaryTour());
  }
}
