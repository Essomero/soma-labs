/**
 * Lockstep gate between the blog lessons and this companion repo.
 *
 * For every `type: "lab"` block in the Full-Stack Interview 40 lessons it checks:
 *   1. the lab path points at a real workspace in this repo,
 *   2. every file the lesson shows exists on disk and its text matches the
 *      shipped source byte-for-byte (after trimming),
 *   3. the lab's `npm run <script>` command exists in that workspace's package.json,
 *   4. lab ids are unique across the whole site.
 *
 * Usage: node scripts/verify-fullstack-sync.mjs [path-to-readme-repo]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const LABS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_ROOT = process.argv[2] ?? path.resolve(LABS_ROOT, "../readme");
const STORIES_DIR = path.join(BLOG_ROOT, "src/content/stories");

function collectLabs(value, out) {
  if (Array.isArray(value)) {
    for (const item of value) collectLabs(item, out);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (value.type === "lab") out.push(value);
  if (Array.isArray(value.paragraphs)) collectLabs(value.paragraphs, out);
  if (Array.isArray(value.sections)) collectLabs(value.sections, out);
}

const lessonNumber = (file) => Number(file.match(/^fs-(\d+)-/)?.[1] ?? 0);

const storyFiles = fs
  .readdirSync(STORIES_DIR)
  .filter((file) => /^fs-\d+-.+\.ts$/.test(file))
  .sort((a, b) => lessonNumber(a) - lessonNumber(b));

const errors = [];
const seenIds = new Map();
let lessons = 0;
let labs = 0;
let filesChecked = 0;

for (const file of storyFiles) {
  const url = pathToFileURL(path.join(STORIES_DIR, file)).href;
  const module = await import(url);
  const story = Object.values(module)[0];
  const found = [];
  collectLabs(story?.sections ?? [], found);
  if (found.length === 0) {
    errors.push(`${file}: no lab blocks`);
    continue;
  }
  lessons++;

  for (const lab of found) {
    labs++;
    if (!lab.id) errors.push(`${file}: lab without id`);
    else if (seenIds.has(lab.id)) errors.push(`${file}: duplicate lab id "${lab.id}" (also in ${seenIds.get(lab.id)})`);
    else seenIds.set(lab.id, file);

    if (!lab.path) {
      errors.push(`${file} [${lab.id}]: missing path`);
      continue;
    }
    const dir = path.join(LABS_ROOT, lab.path);
    if (!fs.existsSync(dir)) {
      errors.push(`${file} [${lab.id}]: path does not exist: ${lab.path}`);
      continue;
    }

    if (lab.command) {
      const script = lab.command.match(/npm run ([\w:-]+)/)?.[1];
      const pkgPath = path.join(dir, "package.json");
      if (script && fs.existsSync(pkgPath)) {
        const scripts = JSON.parse(fs.readFileSync(pkgPath, "utf8")).scripts ?? {};
        if (!(script in scripts)) {
          errors.push(`${file} [${lab.id}]: ${lab.path} has no npm script "${script}"`);
        }
      }
    }

    for (const shown of lab.files ?? []) {
      const onDisk = path.join(dir, shown.path);
      if (!fs.existsSync(onDisk)) {
        errors.push(`${file} [${lab.id}]: file not in repo: ${lab.path}/${shown.path}`);
        continue;
      }
      const actual = fs.readFileSync(onDisk, "utf8").trim();
      const displayed = String(shown.code ?? "").trim();
      if (actual !== displayed) {
        filesChecked++;
        errors.push(`${file} [${lab.id}]: code out of sync with ${lab.path}/${shown.path}`);
      } else {
        filesChecked++;
      }
    }
  }
}

console.log(`Lessons with labs: ${lessons}/${storyFiles.length}`);
console.log(`Lab blocks: ${labs}   Files compared: ${filesChecked}`);
if (errors.length > 0) {
  console.error(`\n${errors.length} sync error(s):`);
  for (const error of errors) console.error(`  ✖ ${error}`);
  process.exit(1);
}
console.log("\n✔ Every lab is in lockstep with the companion repo.");
