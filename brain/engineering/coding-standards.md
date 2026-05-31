# Coding Standards

## Midday Architecture Patterns

Midday is the primary implementation reference for application architecture.
When building or refactoring pages, tables, modals, sheets, sidebar, sign-out,
onboarding, forms, shared dashboard components, loading states, error states,
caching, and tRPC flows, follow Midday's file naming, composition, and coding
patterns unless this Brain documents a specific local divergence.

Pages, tables, modals, sheets, forms, onboarding, sidebar, sign-out, and shared
dashboard components must follow Midday architecture, file naming, and coding
patterns.

## tRPC, Loading, Errors, And Caching

- Data fetching and mutations must use standard Midday tRPC patterns.
- Mutations must include the expected invalidation behavior for affected queries.
- Pages and components must include explicit loading and error states following
  Midday conventions.
- Cache behavior should match the Midday pattern for the same kind of surface:
  page reads, table data, detail panels, sheets, and form mutations.

## Forms

- Forms must follow Midday validation, error handling, and mutation patterns.
- Validation should be colocated and readable, with errors surfaced near the
  relevant control or form summary using the Midday convention.
- Client workflow forms should parse `FormData` through colocated zod schemas
  before calling tRPC mutations. Invalid input must surface field-level errors
  and must not reach payment, donation, foundation, goal, or request mutations.
- Dev quick-fill and quick-login helpers must follow the Plot Keys form-context
  pattern: wire through `react-hook-form` form adapters, `form.reset(...)`, or
  `form.setValue(...)`. Never fill fields by querying or mutating DOM nodes.
- Submit states must communicate pending, success, and failure states without
  requiring users to infer mutation progress.

## shadcn Components

- Use shadcn standard components and patterns.
- Never directly modify shadcn source components for project-specific behavior.
- Create wrapper components for project-specific variants, behavior, analytics,
  permissions, or domain defaults.

## Notifications, URLs, And Generated Links

- Use GND as the reference for the standard notification package system.
- Use Plot Keys as the reference for local URL handling, portless/proxy support,
  generated links, dev quick-fill, and quick-login helpers.
- Runtime app/API origin resolution must go through
  `packages/utils/src/runtime-url.ts`. Do not hardcode localhost origins in app,
  auth, tRPC, or generated-link code when a shared resolver can be used.
