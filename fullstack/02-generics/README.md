# Lab: Generics as Relationships (`fullstack/02-generics`)

Hands-on workbench for `L2 — Write a Generic That Earns Its Place`.

The lesson's claim — *a generic asserts a relationship between types, not a
decoration* — is written down here as runnable code. The demo modules pass; the
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

* `src/relationship.mjs` — `identity` / `identityAny` / `identityUnknown`: the
  return type as a function of the argument type, and what `any` and `unknown`
  fail to express.
* `src/constraints.mjs` — `requireMembers` (the entrance requirement) and `at`
  (the keyed constraint `K extends keyof T` as the body's license).

**Practice problems (fix `src/`, make the test pass):**

1. `src/p1_constrained_wrapper.mjs` — `getById<T extends { id: string }>`: the
   constraint is enforced, not decorative.
2. `src/p2_over_generalized.mjs` — the generic no caller varies; make it concrete
   and stop leaking `undefined` into the rendered path.
3. `src/p3_build_pick.mjs` — build `pick<T, K extends keyof T>` from scratch;
   the constraint refuses keys the object does not have.
