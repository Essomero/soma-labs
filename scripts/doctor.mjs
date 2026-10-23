#!/usr/bin/env node

/**
 * Soma Labs Environment Doctor & Setup Probe
 *
 * Runs automatically on `npm install` (postinstall) or manually via `npm run doctor`.
 * Checks which track runtimes are available and reports which labs are ready to run.
 */

import { execSync } from "child_process";

function getToolVersion(cmd) {
  try {
    const out = execSync(cmd, { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" });
    return out.trim().split("\n")[0];
  } catch {
    return null;
  }
}

const tools = [
  {
    name: "Node.js",
    check: "node --version",
    min: "v20+",
    tracks: "Track runners (run-all scripts)",
    install: "https://nodejs.org or: fnm / nvm install 20",
    required: true,
  },
  {
    name: "Deno",
    check: "deno --version",
    min: "v2.0+",
    tracks: "TypeScript Fast Track (native .ts execution and tests)",
    install: "brew install deno  (or: curl -fsSL https://deno.land/install.sh | sh)",
    required: true,
  },
];

console.log("\n========================================================");
console.log("  Soma Labs: Environment Diagnostics & Track Matrix");
console.log("========================================================\n");

let readyCount = 0;

for (const tool of tools) {
  const ver = getToolVersion(tool.check);
  if (ver) {
    readyCount++;
    console.log(`  [OK] ${tool.name.padEnd(10)} : ${ver}`);
    console.log(`       Tracks ready -> ${tool.tracks}\n`);
  } else {
    const status = tool.required ? "[REQUIRED MISSING]" : "[OPTIONAL NOT DETECTED]";
    console.log(`  ${status} ${tool.name.padEnd(10)}`);
    console.log(`       Impact  : ${tool.tracks} will be skipped.`);
    console.log(`       Install : ${tool.install}\n`);
  }
}

console.log("--------------------------------------------------------");
console.log(`  Summary: ${readyCount} runtime(s) detected and ready to run.`);
console.log("  Soma Labs is modular: you only need the runtime for the");
console.log("  tracks you are currently practicing.");
console.log("--------------------------------------------------------\n");
