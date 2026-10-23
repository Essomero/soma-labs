import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Root `npm test` must be green on a fresh clone. Lesson suites
// (`test:lesson`) are the committed passing baselines; per-lesson
// `npm test` additionally runs practice drills that fail until the
// learner fixes them. Never gate the root run on unfinished drills.

const fullstackDir = path.resolve("fullstack");
const dirs = fs
  .readdirSync(fullstackDir)
  .filter((d) => fs.statSync(path.join(fullstackDir, d)).isDirectory())
  .filter((d) => d !== "common")
  .sort();

console.log("\n========================================================");
console.log("  Running Full-Stack Lesson Suites (test:lesson)");
console.log("  Practice drills are excluded: run `npm test` inside a");
console.log("  lesson folder to attempt those (they fail until fixed).");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

for (const dir of dirs) {
  const fullPath = path.join(fullstackDir, dir);
  const pkgJsonPath = path.join(fullPath, "package.json");

  process.stdout.write(`\n➜ [${dir}] ... `);

  try {
    if (fs.existsSync(pkgJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      const cmd = pkg.scripts && pkg.scripts["test:lesson"] ? "npm run test:lesson" : "npm test";
      execSync(cmd, { cwd: fullPath, stdio: "pipe" });
      console.log("PASS (lesson suite)");
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
