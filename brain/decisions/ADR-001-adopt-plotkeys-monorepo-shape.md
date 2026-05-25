# ADR-001: Adopt PlotKeys Monorepo Shape

## Status

Accepted

## Decision

Al-Infaaq uses the PlotKeys-style Bun + Turbo monorepo shape:

- Apps live in `apps/*`.
- Shared capabilities live in `packages/*`.
- Product and engineering memory lives in `brain/*`.
- Backend workflows move toward API-owned routers and shared packages.

## Consequences

This adds a little upfront structure, but it keeps auth, payments, database,
jobs, and UI boundaries clear before the project grows.
