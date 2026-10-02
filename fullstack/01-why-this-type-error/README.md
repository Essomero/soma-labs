# Lab: Reading the Type Checker (`fullstack/01-why-this-type-error`)

Hands-on workbench for `L1 — Why Does This TypeScript Error?`.

The lesson's mental model — *a value is assignable to a shape when every member the shape requires is
present with a compatible type* — is written down here as runnable code. The demo modules pass; the
three practice problems ship broken and fail.

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

* `src/assignability.mjs` — `isAssignable` / `missingMembers`, the structural assignability rule.
* `src/error_family.mjs` — `classifyError`, maps a checker message to the family that fired.

**Practice problems (fix `src/`, make the test pass):**

1. `src/p1_excess_property.mjs` — the excess property check on a fresh literal.
2. `src/p2_optional_chain.mjs` — the possibly-undefined chain.
3. `src/p3_union_trap.mjs` — safe access on a union is the intersection of member properties.
