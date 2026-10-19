# Lab: Discriminated Unions & Exhaustiveness (`fullstack/03-discriminated-unions`)

Hands-on workbench for `L3: Model This as a Discriminated Union`.

A lab exists so you drive experiments, not just watch tests pass.
In this lab, you probe:
1. **Control-Flow Narrowing & Exhaustiveness**: how literal discriminants eliminate variants branch by branch, and how `assertNever` catches unhandled variants.
2. **Async State & The Destructuring Trap**: why destructuring before narrowing detaches properties from the discriminant.

**How to drive it:**
```bash
npm run lab              # interactive REPL (probe custom shapes, test states, trigger traps)
npm run lab:step         # interactive stepped session (pauses between probes)
npm run lab:probe-1      # Probe 1: Circle variant dispatch and narrowing
npm run lab:probe-2      # Probe 2: Square variant dispatch
npm run lab:probe-3      # Probe 3: Rectangle variant dispatch
npm run lab:probe-4      # Probe 4: Unhandled variant and assertNever exhaustiveness
npm run lab:probe-5      # Probe 5: Async state mutual exclusivity
npm run lab:probe-6      # Probe 6: The destructuring trap simulation
npm run lab:dispatcher   # probe literal discriminants and assertNever exhaustiveness (probes 1-4)
npm run lab:async-state  # probe async-state exclusivity and the destructuring trap (probes 5-6)
npm run tour             # full guided tour
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

* `src/dispatcher.ts`: the `Shape` union with a literal `kind`, the narrowing
  dispatcher `area`, and `assertNever` (the exhaustiveness branch that must be unreachable).
* `src/async_state.ts`: async state as four mutually exclusive members
  (idle, loading, success, error) and the exhaustive `view` renderer.

**Practice problems (fix `src/`, make the test pass):**

1. `src/p1_api_response.ts`: the payment response union and why an uncovered
   status must not fall through to "failed".
2. `src/p2_trap_hunt.ts`: two narrowing failures: the destructure before the
   check, and the optional `alt`.
3. `src/p3_event_log.ts`: the extensible event log; a new event type must throw
   from the exhaustive branch, not format an empty line.
