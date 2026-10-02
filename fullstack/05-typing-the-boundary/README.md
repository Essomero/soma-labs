# Lab: Typing the Boundary (`fullstack/05-typing-the-boundary`)

Hands-on workbench for `L5 — Typing the Boundary: unknown vs any, and Parse Don't Validate`.

The lesson's claim — *the type system's guarantees end at the boundary, so you parse there instead of
casting* — is written down here as runnable code. A miniature zod shows the schema as the single
source of truth (`parse`, `safeParse`, `describe`, `transform`), and the boundary module shows the two
doors untrusted data arrives through. The demo modules pass; the three practice problems ship broken
and fail.

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
npm run test:lesson   # the two demo suites — must pass
npm run test:p1       # problem 1 — fails until you fix it
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
