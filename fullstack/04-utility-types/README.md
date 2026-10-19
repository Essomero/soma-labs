# Lab: Utility Types & Mapped Machinery (`fullstack/04-utility-types`)

Hands-on workbench for `L4: How Does Pick Work?`.

A lab exists so you drive experiments, not just watch tests pass.
In this lab, you probe:
1. **The Mapped Type Machinery**: how `keyof`, `[K in keyof T]`, and `T[K]` rebuild types from types.
2. **Distributive Conditional Types**: how conditionals distribute member by member across unions.
3. **Pattern Matching with infer**: destructuring types inside patterns.

**How to drive it:**
```bash
npm run lab            # interactive REPL (test custom shapes and operations)
npm run lab:step       # interactive stepped session (pauses between probes)
npm run lab:probe-1    # Probe 1: Partial<T> mapped loop
npm run lab:probe-2    # Probe 2: Pick<T, K> and keyed constraint check
npm run lab:probe-3    # Probe 3: Omit<T, K> as inverted pick
npm run lab:probe-4    # Probe 4: Distributive conditional Exclude
npm run lab:probe-5    # Probe 5: Pattern matching and type extraction with infer
npm run lab:machinery  # run all mapped and conditional probes (1-5)
npm run tour           # full guided tour
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

* `src/shape_ops.mjs` — `keysOf`, `memberOf`, `mapShape`, and the hand-built `myPartial` / `myPick` /
  `myOmit` / `myRecord`.
* `src/conditional_types.mjs` — `myExclude` / `myNonNullable` distribution, `matchEach`, and `infer`
  modelled as a destructure of the matched pattern.

**Practice problems (fix `src/`, make the test pass):**

1. `src/p1_my_utilities.mjs` — write `MyPartial`, `MyPick`, and `MyOmit` by hand.
2. `src/p2_distribution.mjs` — the distribution trap in `MyExclude`.
3. `src/p3_deep_keys.mjs` — the senior judgment call: nested key paths for form state.
