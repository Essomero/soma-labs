# Lab: Utility Types & Mapped Machinery (`fullstack/04-utility-types`)

Hands-on workbench for `L4 — Utility Types & the Mapped-Type Machinery`.

The lesson's claim — *a utility type is a recipe in a small language over shapes* — is written down
here as runnable code. `Partial`, `Pick`, `Omit`, `Record`, `Exclude`, `NonNullable`, and `infer` are
rebuilt from `keyof`, the mapped loop, and the conditional's distribution. The demo modules pass; the
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

* `src/shape_ops.mjs` — `keysOf`, `memberOf`, `mapShape`, and the hand-built `myPartial` / `myPick` /
  `myOmit` / `myRecord`.
* `src/conditional_types.mjs` — `myExclude` / `myNonNullable` distribution, `matchEach`, and `infer`
  modelled as a destructure of the matched pattern.

**Practice problems (fix `src/`, make the test pass):**

1. `src/p1_my_utilities.mjs` — write `MyPartial`, `MyPick`, and `MyOmit` by hand.
2. `src/p2_distribution.mjs` — the distribution trap in `MyExclude`.
3. `src/p3_deep_keys.mjs` — the senior judgment call: nested key paths for form state.
