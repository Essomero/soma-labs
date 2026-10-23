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
    tracks: "Full-Stack Interview 40, HogQL, Toggl Labs",
    install: "https://nodejs.org or: fnm / nvm install 20",
    required: true,
  },
  {
    name: "Deno",
    check: "deno --version",
    min: "v2.0+",
    tracks: "TypeScript Fast Track (native .ts execution)",
    install: "brew install deno  (or: curl -fsSL https://deno.land/install.sh | sh)",
    required: false,
  },
  {
    name: "Go",
    check: "go version",
    min: "v1.20+",
    tracks: "Go From First Principles, Toggl concurrency drills",
    install: "brew install go  (or: https://go.dev/dl/)",
    required: false,
  },
  {
    name: "Docker",
    check: "docker info",
    min: "Running daemon",
    tracks: "Postgres 16 & Redis reporting seeds",
    install: "https://docker.com  (or: brew install colima && colima start)",
    required: false,
  },
  {
    name: "Python",
    check: "python3 --version",
    min: "v3.10+",
    tracks: "Python full-stack and ML drills",
    install: "brew install python  (or: uv / pyenv)",
    required: false,
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
