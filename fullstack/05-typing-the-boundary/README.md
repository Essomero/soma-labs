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

### Option A: Deno (Recommended: Native TypeScript runner, zero dependencies)

This workspace uses native TypeScript (.ts) files driven directly by Deno. There are no build steps, no tsconfig, and no node_modules required:

```bash
# If Deno is not yet installed:
# brew install deno (macOS) or curl -fsSL https://deno.land/install.sh | sh

npm run lab          # or: deno task lab
npm run tour         # or: deno task tour
npm run test:lesson  # regression guard for lesson concepts
npm run test:p1      # problem 1 (fails until fixed)
npm run test:p2
npm run test:p3
```

### Option B: Docker Compose

```bash
docker compose run --rm test            # all tests
docker compose run --rm test npm run test:lesson
docker compose run --rm test npm run test:p1
```

## Tear Down & Cleanup

```bash
docker compose down --volumes --remove-orphans
docker image prune -f
```

## The Drills

**Demo (read, then run):**

* `src/schema.ts`: the miniature zod (`string`, `number`, `boolean`, `literal`, `enumeration`,
  `array`, `object`, `optional`, `transform`), plus `parse`, `safeParse`, and `describe` (the
  runtime shadow of `z.infer`).
* `src/boundary.ts`: `readJson` and `decode`: the two doors untrusted data comes through, neither of
  which returns `any`.

**Practice problems (fix `src/`, make the test pass):**

1. `src/p1_boundary_audit.ts`: the boundary audit: an unchecked `res.ok` and an unparsed body.
2. `src/p2_assignability.ts`: the `any` vs `unknown` assignability table.
3. `src/p3_drift_gate.ts`: the CI gate that catches the contract drifting from the client model.
