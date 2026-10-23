# Soma Labs

The official companion repository for hands-on drills, real-world code reproductions, and performance benchmarks across [Soma](https://soma.vercel.app) courses.

```bash
gh repo clone Essomero/soma-labs
cd soma-labs
npm install       # Automatically runs the doctor probe to check installed runtimes
```

---

## The Philosophy: Open-Ended, Polyglot, and Minimal

Soma Labs is an **open-ended laboratory**. The current tracks (Go, TypeScript via Deno, PostgreSQL in Docker, and HogQL) are sample tracks built to explore specific systems. The repository is designed to host drills in any language or runtime: Python, Rust, Zig, C++, SQLite, WebAssembly, or bash.

Every lab adheres to three core rules:

1. **Minimal Dependencies First**: Reach for the standard library before adding an external package. Every dependency is an ongoing maintenance tax. When external libraries are used, they are isolated to their specific track workspace.
2. **Explicit Prerequisites**: Tracks never fail with mysterious missing binaries. Every tool requirement is explicitly declared in the track matrix below.
3. **Automated Diagnostic Setup**: Running `npm install` automatically probes your workstation and tells you exactly which tracks are runnable with your current setup:

```bash
npm run doctor    # Re-run environment diagnostics at any time
```

---

## The Soma Suite

Soma is designed as a three-repository ecosystem:

1. **[Soma](https://github.com/Essomero/soma)**: The web platform, reading experience, private notebook (`/learn`), agent content creation skills, and sovereign edge API.
2. **Soma Labs** (this repo): The companion engineering workspace for running drills, testing servers, and benchmarks across any language or toolchain.
3. **[Son](https://github.com/Essomero/son)**: The local voice agent backend powering oral technical screen interviews and audio Q&A at `http://localhost:7860`.

---

## Track Matrix & Prerequisites

You only need the tools for the tracks you want to run. If you only care about TypeScript, you do not need Go or Docker installed.

| Track | Language / Runtime | Tool Required | What It Tests |
|---|---|---|---|
| **TypeScript Fast Track** | TypeScript | **Deno 2.x+** | Native zero-config .ts execution, structural assignability, generics, unions, Zod boundaries |
| **Go From First Principles** | Go | **Go 1.20+** | Pointers, slice headers, defer LIFO, typed nil traps, goroutines with `-race` |
| **HogQL Access Control** | JavaScript | **Node 20+** | Warehouse permissions, raw query gating, AST analysis, security invariants |
| **Full-Stack Interview 40** | TypeScript / Node | **Node 20+** | React render cycles, TanStack Query invalidation, Fastify pagination, memory leaks |
| **PostgreSQL Reporting** | SQL / Postgres | **Docker Compose** | Temporal rate tables, window functions, gap-free date bucketing, EXPLAIN plans |

### Tool Installation Commands

- **Node.js 20+**: `https://nodejs.org` or `fnm install 20` / `nvm use 20`
- **Deno 2+**: `brew install deno` or `curl -fsSL https://deno.land/install.sh | sh`
- **Go 1.20+**: `brew install go` or `https://go.dev/dl/`
- **Docker**: `https://docker.com` or `brew install colima && colima start`

---

## Running Drills

Run all available drills across the repository:
```bash
npm test
```

Run specific tracks individually:
```bash
npm run test:typescript   # Native TypeScript drills via Deno
npm run test:go           # Go concurrency & race-detector drills
npm run test:hogql        # HogQL warehouse security gate drills
npm run test:toggl        # Toggl full-stack production drills
npm run test:fullstack    # Full-stack interview reproductions
```

Or navigate to any individual lesson directory to inspect the code and run its tests directly:
```bash
cd typescript/01-why-this-type-error && deno test
cd go/06-goroutines-channels && go test -race -v ./...
cd toggl/11-capacity-planning && npm test
cd hogql/04-all-or-nothing && npm test
```

---

## Adding a New Track

To add a new track in any language (for example, Rust, Python, or SQLite):

1. Create a top-level directory: `<track-name>/`
2. Keep dependencies minimal: prefer standard library test runners (`cargo test`, `pytest`, `python -m unittest`).
3. Add a runner script in root: `run-all-<track>.mjs`.
4. Register the test command in `package.json`.
5. Add the prerequisite tool check to `scripts/doctor.mjs`.

---

## License

MIT License. Open to any engineer, thinker, or learner building deep mental models.
