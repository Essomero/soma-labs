<p align="center">
  <img src="icon-soma-labs.png" alt="Soma Labs icon" width="200" />
</p>

# Soma Labs

The official companion repository for hands-on drills that prove each lesson in [Soma](https://soma.vercel.app) courses. Every lab gives you an input to change and shows you the effect of changing it.

```bash
gh repo clone Essomero/soma-labs
cd soma-labs
npm install       # Automatically runs the doctor probe to check installed runtimes
npm test          # Runs every track and reports a combined summary
```

---

## The Philosophy: Open-Ended, Polyglot, and Minimal

Soma Labs is an **open-ended laboratory**. The current TypeScript track is a sample of what a track looks like. The repository is designed to host drills in any language or runtime: Go, Python, Rust, Zig, SQLite, WebAssembly, or bash.

Every lab adheres to three core rules:

1. **Minimal Dependencies First**: Reach for the standard library before adding an external package. Every dependency is an ongoing maintenance tax. When external libraries are used, they are isolated to their specific track workspace.
2. **Explicit Prerequisites**: Tracks never fail with mysterious missing binaries. Every tool requirement is explicitly declared in the track matrix below.
3. **Automated Diagnostic Setup**: Running `npm install` automatically probes your workstation and tells you exactly which tracks are runnable with your current setup:

```bash
npm run doctor    # Re-run environment diagnostics at any time
```

---
## The Soma Suite

Soma is designed as a three-repository ecosystem. Each repo stands alone; the links below are conveniences, not dependencies.

1. **[Soma](https://github.com/Essomero/soma)**: The web platform, reading experience, private notebook (`/learn`), agent content creation skills, and sovereign edge API.
2. **Soma Labs** (this repo): The companion engineering workspace for running drills that back Soma course lessons.
3. **[Son](https://github.com/Essomero/son)**: The local voice agent backend powering oral technical screen interviews and audio Q&A at `http://localhost:7860`. Optional: labs never call it.

---

## Track Matrix & Prerequisites

You only need the tools for the tracks you want to run.

| Track | Language / Runtime | Tool Required | What It Tests |
|---|---|---|---|
| **TypeScript Fast Track** | TypeScript | **Deno 2.x+** | Native zero-config .ts execution, structural assignability, generics, unions, Zod boundaries |
| **Full-Stack Interview 40** | TypeScript / Node | **Node 20+** | Lesson workspaces driven per directory (currently the same five TypeScript lessons) |

### Tool Installation Commands

- **Node.js 20+**: `https://nodejs.org` or `fnm install 20` / `nvm use 20`
- **Deno 2+**: `brew install deno` or `curl -fsSL https://deno.land/install.sh | sh`

---

## Running Drills

Two levels, on purpose:

- **Root `npm test`** runs every track's committed lesson suites with a combined summary (one failing track never hides the rest). Green on a fresh clone.
- **Inside a lesson, `npm test`** runs the full suite including practice drills. Those fail until you fix them: that is the drill, not breakage. `npm run test:lesson` runs only the passing baseline.

```bash
npm test                  # every track, combined summary, green on fresh clone
```

Run tracks individually:
```bash
npm run test:typescript   # TypeScript Fast Track lesson suites via Deno
npm run test:fullstack    # Per-workspace lesson suites across fullstack/
```

Or step through a single lesson directly:
```bash
cd fullstack/01-why-this-type-error && deno test                    # full suite incl. practice drills
cd fullstack/01-why-this-type-error && npm run test:lesson          # baseline only
```

The `typescript/` folder holds symlinks to the same five workspaces, so `typescript/01-why-this-type-error` and `fullstack/01-why-this-type-error` are the same drill. Lesson workspaces need no install step: Deno runs them with zero configuration.

---

## Adding a New Track

To add a new track in any language (for example, Go, Python, or SQLite):

1. Create a top-level directory: `<track-name>/`
2. Keep dependencies minimal: prefer standard library test runners (`go test`, `pytest`, `cargo test`).
3. Add a runner script in root: `run-all-<track>.mjs`, following the pass and fail summary shape of `run-all.mjs`.
4. Register the test command in `package.json` and add the track to `run-all.mjs`.
5. Add the prerequisite tool check to `scripts/doctor.mjs`.
6. Document the track in the matrix above and in the Soma [`lab-setup`](/docs/lab-setup) doc.

---

## License

MIT License. Open to any engineer, thinker, or learner building deep mental models.
