# AI Prompt Rules

## Non-Negotiable Architecture Rules

- Midday is the primary standard for pages, tables, modals, sheets, sidebar,
  forms, onboarding, layouts, tRPC calls, loading states, error states, and
  caching patterns.
- Pages, tables, modals, sheets, forms, onboarding, sidebar, sign-out, and
  shared dashboard components must follow Midday architecture, file naming, and
  coding patterns.
- Data fetching and mutations must use standard Midday tRPC patterns, including
  invalidation, loading states, errors, and caching behavior.
- Forms must follow Midday validation, error handling, and mutation patterns.
- Use shadcn standard components and patterns. Never directly modify shadcn
  source components; create wrapper components for project-specific behavior.
- Use GND as the reference for the standard notification package system.
- Use Plot Keys as the reference for local URL handling, portless/proxy support,
  and generated links.
- Add `app/[...slug]/page.tsx` as a catch-all route that redirects to `/`
  unless this repository has an explicit documented reason to diverge.
