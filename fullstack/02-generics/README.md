# Lab: Generics as Relationships (`fullstack/02-generics`)

Hands-on workbench for `L2: Write a Generic That Earns Its Place`.

A lab exists so you drive experiments, not just watch tests pass.
In this lab, you probe:
1. **The Relationship**: why `<T>(x: T): T` preserves types while `any` erases them and `unknown` refuses access.
2. **Constraints as Gate & License**: why `K extends keyof T` gates callers before runtime and licenses member indexing inside the body.

**How to drive it:**
```bash
npm run lab              # interactive REPL (test custom values, run individual probes)
npm run lab:step         # interactive stepped session (pauses between probes)
npm run lab:probe-1      # Probe 1: Primitive value into identity(x) vs identityAny vs identityUnknown
npm run lab:probe-2      # Probe 2: Array value and element-type preservation in first(arr)
npm run lab:probe-3      # Probe 3: Object shape and downstream member access (.name vs .ghostField)
npm run lab:relationship # run all 3 relationship probes together
npm run lab:constraints  # probe the constraint gate and license specifically
npm run tour             # full guided tour
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
