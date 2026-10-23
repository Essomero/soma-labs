#!/usr/bin/env node

/**
 * Soma Labs root runner — runs every track and reports a combined summary.
 * Unlike chained `&&` scripts, one failing track never hides the rest.
 * Exit code is 0 only when every track passes.
 */

import { execSync } from "child_process";

const tracks = [
  { name: "TypeScript Fast Track", cmd: "node run-all-typescript.mjs" },
  { name: "Full-Stack Interview 40", cmd: "node run-all-fullstack.mjs" },
];

console.log("\n========================================================");
console.log("  Soma Labs: Full Run (every track, combined summary)");
console.log("========================================================\n");

const results = [];
for (const track of tracks) {
  try {
    execSync(track.cmd, { stdio: "inherit" });
    results.push({ name: track.name, ok: true });
  } catch {
    results.push({ name: track.name, ok: false });
  }
}

console.log("\n--------------------------------------------------------");
console.log("  Summary");
console.log("--------------------------------------------------------");
let failed = 0;
for (const r of results) {
  console.log(`  [${r.ok ? "PASS" : "FAIL"}] ${r.name}`);
  if (!r.ok) failed++;
}
console.log("--------------------------------------------------------\n");

process.exit(failed ? 1 : 0);
