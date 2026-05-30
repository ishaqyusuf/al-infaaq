# Repo Structure

## Required Route Conventions

- App Router pages that depend on live database, session, or tRPC state should
  follow the Midday route organization pattern and opt into the appropriate
  dynamic/loading/error behavior.
- Add `app/[...slug]/page.tsx` as a catch-all route that redirects to `/`
  unless this repository has an explicit documented reason to diverge.
- Sign-out, onboarding, sidebar, shared dashboard surfaces, modals, sheets,
  forms, and tables must follow Midday architecture, file naming, and coding
  patterns.

## Table Structure

Tables should follow the Midday table layout:

- `components/tables/core`
- `components/tables/<domain>/columns.tsx`
- `components/tables/<domain>/data-table.tsx`
- `components/tables/<domain>/table-header.tsx`
- `components/tables/<domain>/skeleton.tsx`
- `components/tables/<domain>/empty-states.tsx`
- `components/tables/<domain>/bottom-bar.tsx` when needed
- `components/tables/<domain>/action-menu.tsx` when needed

Current implemented table domains:

- `components/tables/admin-audit-logs`
- `components/tables/admin-donations`
- `components/tables/admin-foundations`
- `components/tables/admin-requests`
- `components/tables/foundation-requests`
- `components/tables/public-requests`
- `components/tables/trustee-reviews`
- `components/tables/wallet-donations`

## Sheet Structure

Sheets should follow the Midday global sheet layout:

- `components/sheets/global-sheets.tsx`
- `components/sheets/global-sheets-provider.tsx`
- `components/sheets/...`

## Shared Components

- Shared dashboard components should follow Midday naming, ownership, and
  composition patterns.
- Project-specific behavior for shadcn primitives should live in wrappers, not
  direct edits to shadcn source components.
