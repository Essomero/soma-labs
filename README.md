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
├── docker-compose.yml           # Shared local Postgres 16 & Redis
├── go/                          # Go From First Principles (7 Lessons)
│   ├── 01-shallow-end/          # L1: Packages, variables, zero values, multiple returns
│   ├── 02-pointers-structs/     # L2: Pointer vs value receivers, struct embedding
│   ├── 03-slices-maps/          # L3: Slice headers, 3-index subslices, map comma-ok
│   ├── 04-errors-defer/         # L4: %w wrapping, errors.Is/As, defer LIFO order
│   ├── 05-interfaces/           # L5: Implicit satisfaction, typed-nil trap and fix
│   ├── 06-goroutines-channels/  # L6: Channels, select timeouts, mutex under -race
│   └── 07-context-http/         # L7: Cancellation tree, stdlib HTTP, JSON streaming
├── fullstack/                    # Full-Stack Interview 40 Track (TypeScript, React, Node, browser, DB, testing, ops)
│   ├── 01-why-this-type-error/   # L1: structural assignability, the error family, excess-property check
│   ├── 02-generics/              # L2: constrained generics, inference sites, when NOT to generalize
│   └── ...                       # one workspace per lesson, 01-40
└── toggl/                       # Toggl Senior Full-Stack Track
    ├── 01-go-basics/            # Worker pools, error wrapping, stdlib HTTP
    ├── 02-time-dst/             # Interval arithmetic, 23h/25h DST days
    ├── 03-postgres-reporting/   # Window functions, gap-free buckets, index plans
    ├── 04-api-keyset/           # Fastify keyset pagination, bulk mutations, 409s
    ├── 05-state-sync/           # URL state synchronization, mirror bug elimination
    ├── 06-query-cache/          # TanStack Query invalidation graph, rollback
    ├── 07-table-virtualization/ # 50,000-row table windowing & inline edit
    ├── 08-perf-diagnostics/     # N+1 detection, React render profiler
    ├── 09-contract-tests/       # Table-driven tests, contract assertions
    ├── 10-skill-drills/         # Timed screen drills (race condition, autocomplete)
    ├── 11-capacity-planning/    # Availability calendar, plan vs actual outer join
    ├── 12-eventual-consistency/ # Replica lag, monotonic read fence, rollback
    ├── 13-capacity-heatmap/     # Heatmap matrix calculation, zero baseline
    ├── 14-dense-grid-css/       # Subgrid row alignment, sticky scroll container
    ├── 15-distroless-container/ # Multi-stage Dockerfile, static binary, signals
    └── 16-ai-review-gate/       # AST linter for %w, context propagation, error check
```

---

## Prerequisites

- **Node.js**: v20+ (Node v24 with native `node:test` runner included)
- **Go**: v1.20+ (with standard `go test` and `-race`)
- **Docker & Docker Compose**: (Optional, for running real Postgres reporting queries)

---

## Quick Start: Running Drills

Run all drills from root:
```bash
npm test
```

Run Toggl track drills:
```bash
npm run test:toggl
```

Run Go foundations drills:
```bash
npm run test:go
```

Or navigate to any specific lesson directory:
```bash
cd toggl/11-capacity-planning && npm test
cd go/05-interfaces && go test -v ./...
```
