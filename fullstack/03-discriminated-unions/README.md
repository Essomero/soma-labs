# Lab: Discriminated Unions & Exhaustiveness (`fullstack/03-discriminated-unions`)

Hands-on workbench for `L3 — Model the States So Illegal Ones Can't Exist`.

The lesson's pattern — *a literal discriminant plus a narrowing dispatcher plus
an exhaustive `never` branch* — is written down here as runnable code. The demo
modules pass; the three practice problems ship broken and fail.

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

* `src/dispatcher.mjs` — the `Shape` union with a literal `kind`, the narrowing
  dispatcher `area`, and `assertNever` — the exhaustiveness branch that must be
  unreachable.
* `src/async_state.mjs` — async state as four mutually exclusive members
  (idle/loading/success/error) and the exhaustive `view` renderer.

**Practice problems (fix `src/`, make the test pass):**

1. `src/p1_api_response.mjs` — the payment response union and why an uncovered
   status must not fall through to "failed".
2. `src/p2_trap_hunt.mjs` — two narrowing failures: the destructure before the
   check, and the optional `alt`.
3. `src/p3_event_log.mjs` — the extensible event log; a new event type must throw
   from the exhaustive branch, not format an empty line.
