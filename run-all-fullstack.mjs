import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const fullstackDir = path.resolve("fullstack");
const dirs = fs
  .readdirSync(fullstackDir)
  .filter((d) => fs.statSync(path.join(fullstackDir, d)).isDirectory())
  .sort();

console.log("\n========================================================");
console.log("  Running all Full-Stack Interview 40 Labs");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

for (const dir of dirs) {
  const fullPath = path.join(fullstackDir, dir);
  const pkgJsonPath = path.join(fullPath, "package.json");
  const goModPath = path.join(fullPath, "go.mod");

  process.stdout.write(`\n➜ [${dir}] ... `);

  try {
    if (fs.existsSync(goModPath)) {
      execSync("go test ./...", { cwd: fullPath, stdio: "pipe" });
      console.log("PASS (Go test suite)");
      passed++;
    } else if (fs.existsSync(pkgJsonPath)) {
      execSync("npm test", { cwd: fullPath, stdio: "pipe" });
      console.log("PASS (Node test suite)");
      passed++;
    } else {
      console.log("SKIP (No test runner found)");
    }
  } catch (err) {
    console.log("FAIL");
    console.error(err.stdout ? err.stdout.toString() : err.message);
    failed++;
  }
}

console.log("\n--------------------------------------------------------");
console.log(`Results: ${passed} passed, ${failed} failed across ${dirs.length} workspaces.`);
console.log("--------------------------------------------------------\n");

if (failed > 0) process.exit(1);
