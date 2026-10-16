import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const tsWorkspaces = [
  "fullstack/01-why-this-type-error",
  "fullstack/02-generics",
  "fullstack/03-discriminated-unions",
  "fullstack/04-utility-types",
  "fullstack/05-typing-the-boundary",
];

const runAll = process.argv.includes("--all") || process.argv.includes("--problems");
const testCmd = runAll ? "npm test" : "npm run test:lesson";

console.log("\n========================================================");
console.log(`  Running TypeScript Interview Fast Track Labs (${tsWorkspaces.length} Workspaces)`);
console.log(`  Mode: ${runAll ? "All tests (including practice problem drills)" : "Lesson regression suites"}`);
console.log("========================================================\n");

let passed = 0;
let failed = 0;

for (const relDir of tsWorkspaces) {
  const fullPath = path.resolve(relDir);
  const dirName = path.basename(relDir);

  process.stdout.write(`\n➜ [${dirName}] ... `);

  try {
    execSync(testCmd, { cwd: fullPath, stdio: "pipe" });
    console.log("PASS");
    passed++;
  } catch (err) {
    console.log("FAIL");
    console.error(err.stdout ? err.stdout.toString() : err.message);
    failed++;
  }
}

console.log("\n--------------------------------------------------------");
console.log(`Results: ${passed} passed, ${failed} failed across ${tsWorkspaces.length} workspaces.`);
if (!runAll) {
  console.log("Tip: Pass --problems to run student practice challenges (designed to fail until solved).");
}
console.log("--------------------------------------------------------\n");

if (failed > 0) process.exit(1);
