# Lab: Typing the Boundary (`fullstack/05-typing-the-boundary`)

Hands-on workbench for `L5: unknown or any?`.

A lab exists so you drive experiments, not just watch tests pass.
In this lab, you probe:
1. **The Two Doors**: Door A (The Cast `as User`) vs Door B (The Schema Gate `safeParse`).
2. **Downstream Execution Hazards**: why type casting causes runtime crashes on missing or corrupted data.
3. **API Drift Detection**: catching when backend responses drift from internal contracts.

**How to drive it:**
```bash
npm run lab           # interactive REPL (test custom payloads)
npm run lab:step      # interactive stepped session (pauses between probes)
npm run lab:probe-1   # Probe 1: Valid untrusted payload through Door A vs Door B
npm run lab:probe-2   # Probe 2: Missing required field (type cast crash vs schema catch)
npm run lab:probe-3   # Probe 3: Incompatible field type
npm run lab:probe-4   # Probe 4: API schema drift detection
npm run lab:boundary # run all trust boundary probes (1-4)
npm run tour         # full guided tour
```

## Quick Start

### Option A — Docker Compose (recommended)

The compose file mounts this directory into the container, so edits in `src/` are picked up instantly.

```bash
docker compose run --rm test            # all tests
docker compose run --rm test npm run test:lesson
docker compose run --rm test npm run test:p1
```

### Option B — Native Node (Node 20+, no dependencies)

This workspace uses Node's built-in test runner. There is no `node_modules` to install:
```bash
npm run tour         # see the guided tour
npm run test:lesson  # regression guard for the lesson concepts
npm run test:p1      # problem 1 (fails until fixed)
npm run test:p2
npm run test:p3
```

## Tear Down & Cleanup

```bash
docker compose down --volumes --remove-orphans
docker image prune -f
```

## The Drills

**Demo (read, then run):**

* `src/schema.mjs` — the miniature zod: `string` / `number` / `boolean` / `literal` / `enumeration` /
  `array` / `object` / `optional` / `transform`, plus `parse`, `safeParse`, and `describe` (the
  runtime shadow of `z.infer`).
* `src/boundary.mjs` — `readJson` and `decode`: the two doors untrusted data comes through, neither of
  which returns `any`.

**Practice problems (fix `src/`, make the test pass):**

1. `src/p1_boundary_audit.mjs` — the boundary audit: an unchecked `res.ok` and an unparsed body.
2. `src/p2_assignability.mjs` — the `any` vs `unknown` assignability table.
3. `src/p3_drift_gate.mjs` — the CI gate that catches the contract drifting from the client model.
