#!/usr/bin/env node
/**
 * TypeScript Trust Boundary Lab — Cast vs Schema Validation Simulator
 *
 * Interactive workbench for exploring the runtime trust boundary:
 *   1. Door A: The Type Cast (`as User`) — why casting is not validation and leads to production runtime crashes.
 *   2. Door B: The Schema Gate (`safeParse`) — parse, don't validate at the system boundary.
 *   3. Schema Drift: Catching when external API payloads drift from internal contracts.
 *
 * Usage:
 *   node lab.mjs                  Interactive REPL session (or tour in non-interactive shell)
 *   node lab.mjs --tour           Run full guided tour
 *   node lab.mjs boundary         Run trust boundary comparison probe
 *   node lab.mjs test <raw_json>  Test raw JSON through both doors
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
} from "./src/schema.mjs";
import { readJson, decode } from "./src/boundary.mjs";

export function formatJson(val) {
  return JSON.stringify(val);
}

export function probeBoundaryDoors(rawInput, schema = userSchema) {
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

  const payload = parsedJson.value;

  // --- Door A: The Cast ('as User') ---
  lines.push(`\n--------------------------------------------------------------------------------`);
  lines.push(`[DOOR A] The Cast: (payload as User)`);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`  Compiler Check:   BYPASSED ('as' instructs compiler to disable checking)`);
  lines.push(`  Compile Error:    NONE (compiles cleanly)`);
  lines.push(`  Runtime Check:    NONE (the assertion is erased at compile time)`);

  // Downstream dereference simulation: user.email.toLowerCase()
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
  } catch (err) {
    lines.push(
      `  Downstream Code:  user.email.toLowerCase()`,
      `  RUNTIME CRASH:    ${err.name}: ${err.message}`,
      `  Verdict:          PRODUCTION OUTAGE. A type cast is a promise the runtime never made.`,
    );
  }

  // --- Door B: The Schema Gate ('safeParse') ---
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

export function runBoundaryTour() {
  const out = [];
  out.push("================================================================================");
  out.push("  TypeScript Trust Boundary Lab: The Two Doors");
  out.push("================================================================================");

  out.push("\n[Scenario 1] Valid Untrusted Payload");
  out.push(
    probeBoundaryDoors(
      JSON.stringify({
        id: "u-101",
        name: "Ada Lovelace",
        email: "ada@analytical.engine",
        role: "admin",
      }),
    ),
  );

  out.push("\n[Scenario 2] Payload Missing Required Member ('email')");
  out.push(
    probeBoundaryDoors(
      JSON.stringify({
        id: "u-102",
        name: "Charles Babbage",
        role: "member",
      }),
    ),
  );

  out.push("\n[Scenario 3] Payload with Incompatible Member Type ('email' is number)");
  out.push(
    probeBoundaryDoors(
      JSON.stringify({
        id: "u-103",
        name: "Corrupt Row",
        email: 12345,
        role: "member",
      }),
    ),
  );

  out.push("\n[Scenario 4] API Drift: Renamed Field ('email_address' instead of 'email')");
  out.push(
    probeBoundaryDoors(
      JSON.stringify({
        id: "u-104",
        name: "Drifted Backend",
        email_address: "drift@api.internal",
        role: "member",
      }),
    ),
  );

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
    prompt: "lab-boundary> ",
  });

  console.log("\nTypeScript Trust Boundary Interactive Lab");
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
      console.log("  boundary                     Probe trust boundary (Door A vs Door B)");
      console.log("  test <raw_json>              Test raw payload through Door A and Door B");
      console.log("  exit                         Exit interactive lab\n");
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

if (firstArg === "--tour" || firstArg === "tour" || firstArg === "--topic=boundary" || firstArg === "boundary") {
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
