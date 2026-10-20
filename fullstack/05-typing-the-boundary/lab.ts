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
import { readJson, decode, type ReadJsonResult } from "./src/boundary.ts";
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
  return card("[Probe 1/4] Trust Boundary: Valid Untrusted Payload", [
    theme.slate("Code Under Test (src/schema.ts & src/boundary.ts):"),
    "  " + highlightTs('const userSchema = object({ id: string(), name: string(), email: string(), role: enumeration(["admin", "member"]) });'),
    "  " + highlightTs('function safeParse(schema: Schema<T>, value: unknown): SafeParseResult<T>;'),
    "",
    theme.slate("Raw Input:"),
    "  " + theme.green('\'{"id":"u-101","name":"Ada Lovelace","email":"ada@analytical.engine","role":"admin"}\''),
    "",
    theme.slate("Comparison:"),
    "  " + treeStep("Door A (as User)", badge("LUCK", "warning") + " " + theme.slate("Compiles with 0 warnings. user.email.toLowerCase() succeeds")),
    "  " + treeStep("Door B (safeParse)", badge("SAFE", "pass") + " " + theme.green("Validates shape at boundary. Returns verified typed data")),
    "  " + treeStep("Danger", theme.rose("Door A succeeded only by luck! If upstream API omitted 'email', Door A crashes")),
  ]);
}

export function runProbe2(): string {
  const pipeline = dataFlowPipeline([
    { label: "Untrusted JSON", sub: "Missing 'email'" },
    { label: "Door A (as User)", sub: "Runtime CRASH" },
    { label: "Door B (Schema)", sub: "safeParse Gate" },
    { label: "HTTP 400 Handle", sub: "Crash Prevented" },
  ]);

  return card("[Probe 2/4] Missing Required Field: The Type Cast Crash", [
    theme.slate("Code Under Test:"),
    "  " + theme.rose("// Door A — The Type Assertion Lie:") + "",
    "  " + highlightTs('const user = raw as User; // Lie to the compiler: "trust me"'),
    "  " + highlightTs('console.log(user.email.toLowerCase());'),
    "",
    theme.slate("Boundary Flowchart:"),
    ...pipeline.split("\n").map((l) => "  " + l),
    "",
    theme.slate("Door A Execution (payload missing 'email'):"),
    "  " + treeStep("1. COMPILER CHECK", theme.rose("BYPASSED ('as User' shuts off compiler checking)")),
    "  " + treeStep("2. COMPILE ERROR", theme.rose("NONE (compiles cleanly)")),
    "  " + treeStep("3. RUNTIME CRASH", badge("PRODUCTION OUTAGE", "fail") + " " + theme.rose("TypeError: Cannot read properties of undefined (reading 'toLowerCase')")),
    "  " + treeStep("4. VERDICT", theme.bold("A type cast is a promise the runtime never made")),
    "",
    theme.slate("Door B Execution (The Schema Gate):"),
    "  " + highlightTs('const result = userSchema.safeParse(raw);'),
    "  " + treeStep("1. BOUNDARY CHECK", badge("REJECTED", "refused") + " " + theme.rose('Caught at entry before reaching business logic')),
    "  " + treeStep("2. ISSUE PATH", theme.cyan('["email"]')),
    "  " + treeStep("3. REASON", theme.amber('email: expected string')),
    "  " + treeStep("4. CRASH PREVENTED", badge("PASS", "pass") + " " + theme.green("YES. Application returns HTTP 400 cleanly"), true),
  ]);
}

export function runProbe3(): string {
  return card("[Probe 3/4] Incompatible Field Type: Corrupt Payload", [
    theme.slate("Execution with corrupted payload ('{\"id\":\"u-103\",\"name\":\"Corrupt Row\",\"email\":12345,\"role\":\"member\"}'):"),
    "",
    "  " + treeStep("Door A (as User)", theme.rose("Compiler believes 'email' is string")),
    "  " + treeStep("Runtime Error", badge("CRASH", "fail") + " " + theme.rose("TypeError: user.email.toLowerCase is not a function (received number)")),
    "",
    "  " + treeStep("Door B (safeParse)", badge("CAUGHT", "pass") + " " + theme.green("Intercepted at boundary before business logic")),
    "  " + treeStep("Diagnostic", theme.amber("email: expected string at path ['email']"), true),
  ]);
}

export function runProbe4(): string {
  return card("[Probe 4/4] API Drift: Renamed Backend Field", [
    theme.slate("Execution with drifted payload ('{\"id\":\"u-104\",\"name\":\"Drifted API\",\"email_address\":\"drift@api.dev\",\"role\":\"member\"}'):"),
    "",
    "  " + treeStep("The Problem", theme.amber("Backend renamed 'email' to 'email_address'")),
    "  " + treeStep("Door A Impact", badge("SILENT BUG", "fail") + " " + theme.rose("Downstream code expects 'user.email' and gets undefined")),
    "  " + treeStep("Door B Gate", badge("PREVENTED", "pass") + " " + theme.green("safeParse fails on missing 'email', surfacing contract drift in staging"), true),
  ]);
}

export function runBoundaryTour(): string {
  return [runProbe1(), "\n" + runProbe2(), "\n" + runProbe3(), "\n" + runProbe4()].join("\n");
}

export function probeBoundaryDoors(rawInput: unknown, schema: Schema<any> = userSchema): string {
  const lines = [
    `Contract Schema: ${describe(schema)}`,
    `Raw Input:       ${typeof rawInput === "string" ? rawInput : formatJson(rawInput)}`,
  ];

  const parsedJson: ReadJsonResult = typeof rawInput === "string" ? readJson(rawInput) : { ok: true, value: rawInput };

  if (!parsedJson.ok) {
    lines.push(
      `\n[JSON Parse Check] ` + badge("FAILED", "refused") + ` (malformed JSON: ${parsedJson.message})`,
      `Both doors reject malformed syntax.`,
    );
    return lines.join("\n");
  }

  const payload = parsedJson.value as any;

  lines.push(`\n--------------------------------------------------------------------------------`);
  lines.push(`[DOOR A] The Cast: (payload as User) ` + badge("UNCHECKED", "warning"));
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
      `  Downstream Code:  user.email.toLowerCase() → "${payload.email.toLowerCase()}"`,
      `  Execution Status: ` + badge("SUCCESS", "pass") + ` (payload happened to meet expectations)`,
    );
  } catch (err: any) {
    lines.push(
      `  Downstream Code:  user.email.toLowerCase()`,
      `  RUNTIME CRASH:    ` + badge("OUTAGE", "fail") + ` ${err.name}: ${err.message}`,
      `  Verdict:          PRODUCTION OUTAGE. A type cast is a promise the runtime never made.`,
    );
  }

  lines.push(`\n--------------------------------------------------------------------------------`);
  lines.push(`[DOOR B] The Schema Gate: schema.safeParse(payload) ` + badge("VERIFIED", "pass"));
  lines.push(`--------------------------------------------------------------------------------`);
  const result = safeParse(schema, payload);

  if (result.success) {
    lines.push(
      `  Schema Gate:      ` + badge("PASSED", "pass"),
      `  Validated Data:   ${formatJson(result.data)}`,
      `  Downstream Code:  user.email.toLowerCase() → "${result.data.email.toLowerCase()}"`,
      `  Guaranteed Type:  Downstream code only receives verified data with non-null members.`,
    );
  } else {
    lines.push(
      `  Schema Gate:      ` + badge("REJECTED", "refused"),
      `  Error Path:       [${result.error.path.map((p) => `"${p}"`).join(", ")}]`,
      `  Error Message:    ${result.error.message}`,
      `  Crash Prevented:  ` + badge("YES", "pass"),
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
  await waitForEnter(rl, "\n" + theme.cyan("[Press Enter to proceed to Probe 2/4: Missing Required Field Crash ➔] "));

  console.log("\n" + runProbe2());
  await waitForEnter(rl, "\n" + theme.cyan("[Press Enter to proceed to Probe 3/4: Incompatible Field Type ➔] "));

  console.log("\n" + runProbe3());
  await waitForEnter(rl, "\n" + theme.cyan("[Press Enter to proceed to Probe 4/4: API Schema Drift Detection ➔] "));

  console.log("\n" + runProbe4());
  console.log("\n" + badge("COMPLETE", "pass") + " All 4 trust boundary probes completed! Type 'deno task lab' or 'npm run lab' for the interactive REPL.\n");
  rl.close();
}

export async function startRepl(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: theme.cyan("lab-boundary ❯ "),
  });

  console.log(`\n${theme.cyan(theme.bold("❖ TypeScript Trust Boundary Interactive Lab"))} ${theme.dim("(running with Deno)")}`);
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
