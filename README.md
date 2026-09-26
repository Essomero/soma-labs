# Soma Labs

The official companion repository for hands-on drills, real-world code reproductions, and performance benchmarks across [Soma](https://soma.vercel.app) courses.

Clone this repository once:
```bash
gh repo clone Essomero/soma-labs
cd soma-labs
```

---

## Directory Structure

```
soma-labs/
├── docker-compose.yml        # Shared local Postgres 16 & Redis
└── toggl/                    # Toggl Skills Test Fast Track (10 Lessons)
    ├── 01-go-basics/         # L1: Worker pools, error wrapping, stdlib HTTP
    ├── 02-time-dst/          # L2: Interval arithmetic, 23h/25h DST days
    ├── 03-postgres-reporting/# L3: Window functions, gap-free buckets, index plans
    ├── 04-api-keyset/        # L4: Fastify keyset pagination, bulk mutations, 409s
    ├── 05-state-sync/        # L5: URL state synchronization, mirror bug elimination
    ├── 06-query-cache/       # L6: TanStack Query invalidation graph, rollback
    ├── 07-table-virtualization/# L7: 50,000-row table windowing & inline edit
    ├── 08-perf-diagnostics/  # L8: N+1 detection, React render profiler
    ├── 09-contract-tests/    # L9: Table-driven tests, contract assertions
    └── 10-skill-drills/      # L10: Timed screen drills (race condition, autocomplete)
```

---

## Prerequisites

- **Node.js**: v20+ (Node v24 with native `node:test` runner included)
- **Go**: v1.20+ (with standard `go test` and `-race`)
- **Docker & Docker Compose**: (Optional, for running real Postgres reporting queries)

---

## Quick Start: Running Drills

Run all Toggl drills from root:
```bash
npm run test:toggl
```

Or navigate to any specific lesson directory:
```bash
cd toggl/01-go-basics && go test -v -race ./...
cd toggl/04-api-keyset && npm test
```
