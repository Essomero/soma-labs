# Lab: Reading the Type Checker (`fullstack/01-why-this-type-error`)

Hands-on workbench for `L1: Why Does This TypeScript Error?`.

A lab exists so you drive experiments, not just watch tests pass.
In this lab, you probe:
1. **Structural Assignability & Freshness**: why variables with extra properties are assignable, but fresh literals trigger the excess property check.
2. **The Five Error Families**: what the checker asserts, what the naive fix discards, and what the senior fix is.

**How to drive it:**
```bash
npm run lab               # interactive REPL (test custom values and shapes)
npm run lab:step          # interactive stepped session (pauses between probes)
npm run lab:probe-1       # Probe 1: Exact shape match
npm run lab:probe-2       # Probe 2: Missing required member (TS2322)
npm run lab:probe-3       # Probe 3: Variable reference & structural subtyping
npm run lab:probe-4       # Probe 4: Fresh literal excess property check (TS2353)
npm run lab:probe-5       # Probe 5: Diagnostic error families matrix
npm run lab:assignability # run all assignability probes (1-4)
npm run lab:family        # run error family diagnostic probe (5)
npm run tour              # full guided tour
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

* `src/assignability.ts`: `isAssignable` / `missingMembers`, the structural assignability rule.
* `src/error_family.ts`: `classifyError`, maps a checker message to the family that fired.

**Practice problems (fix `src/`, make the test pass):**

1. `src/p1_excess_property.ts`: the excess property check on a fresh literal.
2. `src/p2_optional_chain.ts`: the possibly-undefined chain.
3. `src/p3_union_trap.ts`: safe access on a union is the intersection of member properties.
