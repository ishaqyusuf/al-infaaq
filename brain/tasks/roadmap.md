# Task Roadmap

This is the execution roadmap for taking Al-Infaaq from the current scaffold to
100% completion for the first stable release.

## Completed

- Scaffold strict PlotKeys-style monorepo.
- Build first product dashboard shell.
- Add Paystack and Lemon Squeezy route stubs.
- Add QR metadata route for request banners.
- Add API, auth, DB, UI, utils, and jobs package boundaries.
- Generate and apply the first PostgreSQL migration.
- Add Prisma 7 config and local database script wiring.
- Install Better Auth and add API-mounted auth handler.
- Add Better Auth Prisma schema fields and migration.
- Add tRPC permission middleware and product mutation routers for foundations,
  Trustee reviews, donation requests, goals, admin foundation status, and
  donation checkout starts.
- Remove Next server action usage from current web product workflows.
- Move server-rendered web page domain reads to tRPC caller procedures, leaving
  direct Prisma access only in API/auth/jobs and route-handler exceptions.
- Add Bun test coverage for the role permission matrix, payment webhook
  signatures, tRPC router contracts, and web architecture guardrails.
- Remove raw provider checkout route/procedure entrypoints so `donations.start`
  is the single checkout path tied to persisted pending donations.
- Add admin payment reconciliation reporting for donation statuses, provider
  totals, and pending/failed/refunded review items.
- Add idempotent monthly reminder queueing plus email reminder processing tests
  with provider injection and sent-row marking.
- Move QR-backed banner generation into a protected tRPC mutation, store
  generated `FundraisingBanner` records, and keep the web route as a generated
  asset download response.
- Add foundation request performance reporting with aggregate progress, status
  counts, remaining amount, and banner count while keeping spender identity out
  of foundation views.
- Add a deployment runbook covering environment variables, preflight commands,
  webhook setup, privacy checks, and rollback.
- Add tRPC-owned profile-completion redirects for spender goals and foundation
  Trustee onboarding from the dashboard.
- Record audit logs for privileged admin and Trustee actions.
- Add request lifecycle guardrails covering approved-foundation requirements for
  public reads, checkout starts, publishing, and banner generation.
- Extract foundation request management into the required Midday-style table
  structure under `components/tables/foundation-requests`.
- Extract Trustee review queue and decisions into the required Midday-style
  table structure under `components/tables/trustee-reviews`.
- Extract admin foundations, donation requests, donations/reconciliation, and
  audit logs into required Midday-style table structures under
  `components/tables/admin-*`.
- Extract public request discovery and private wallet donation history into
  required Midday-style table structures under `components/tables/public-requests`
  and `components/tables/wallet-donations`.
- Add workflow-level tRPC tests for Trustee approval, admin suspension, request
  lifecycle guards, and donation checkout persistence with mocked external
  boundaries.
- Fix and test spender access to foundation onboarding submission so new
  foundation applicants can enter Trustee review.
- Add payment webhook workflow tests for success/refund idempotency, request
  raised totals, funded/reopened transitions, and pending-only failures.
- Default the web shell to dark mode, align auth forms with shared shadcn-style
  inputs/labels, and add an architecture guardrail for Trustee-reviewed
  metadata plus the `alinfaaq` domain direction.

## Phase 1: Better Auth and Access Control

- Complete Better Auth email/password sign-in and sign-up UI.
- Add role-aware sign-in/onboarding for spenders, foundations, Trustees,
  and admins.
- Enforce permissions in API procedures and protected web routes.
- Move product mutations and protected reads behind typed tRPC procedures instead
  of Next server actions.
Acceptance:

- Every role can access its own dashboard and is blocked from other roles'
  private workflows.
- Permission checks cover both API and UI entrypoints.
- No new product workflow should be implemented with Next server actions.

## Phase 2: Foundation Onboarding and Trustee Review

- Build foundation profile creation and edit pages.
- Build Trustee review submission flow.
- Build Trustee queue, detail, approve, reject, and notes flows.
- Build admin foundation status management.
- Block publishing and collections for unapproved foundations.

Acceptance:

- A foundation can move from draft to pending Trustee review to approved.
- Rejected or suspended foundations cannot publish public donation requests.

## Phase 3: Donation Requests and Public Pages

- Build request draft, publish, funded, archive, and detail workflows.
- Build public request pages with request progress and foundation trust status.
- Build spender request discovery/listing.
- Store and display aggregate raised totals without exposing spender identities.
- Keep approved-foundation request lifecycle guards covered by API contract
  tests.
- Continue applying the same table structure to any new list-heavy surfaces.

Acceptance:

- Approved foundations can publish requests.
- Spenders can browse, open, and begin donating to public requests.

## Phase 4: Payments, Webhooks, and Reconciliation

- Complete Paystack donation initialization, verification, callback, and webhook
  handling.
- Complete Lemon Squeezy checkout creation and webhook handling.
- Persist donation status transitions from provider events.
- Add webhook signature validation and idempotency.
- Add admin reconciliation views for mismatches, failures, and refunds.

Acceptance:

- Paystack and Lemon Squeezy test donations complete end to end.
- Duplicate webhooks cannot double-count request totals.

## Phase 5: Spender Goals, Wallet, and Reminders

- Build monthly giving goal setup and edit flow.
- Build private giving wallet/history with hidden-history display mode.
- Track goal progress from successful donations.
- Implement scheduled email reminders.
- Add reminder preference management.

Acceptance:

- Spenders can set goals, donate, and see private monthly progress.
- Reminders respect user preferences.

## Phase 6: QR-Backed Banner Generation

- Convert QR metadata route into a banner generation/composition flow.
- Store generated banner records.
- Build foundation banner preview, download, and share UI.
- Verify QR codes resolve to the correct public request page.

Acceptance:

- Foundations can generate a shareable banner for a published request.
- Banner QR scans open the matching public request page.

## Phase 7: Admin, Reporting, and Trust Operations

- Build admin views for users, foundations, requests, donations, and audit logs.
- Add foundation payout readiness and reconciliation reporting.
- Add request impact report flow.
- Add tools for suspensions and suspicious activity review.

Acceptance:

- Admins can inspect and act on platform operations without database access.
- Foundations can view request performance without seeing donor identities.

## Phase 8: QA, Security, and Launch Readiness

- Add unit and integration tests for auth, permissions, payments, webhooks,
  request state transitions, and reminder jobs.
- Add end-to-end coverage for spender, foundation, Trustee, and admin
  flows.
- Expand workflow-level tRPC tests beyond source/contract assertions for the
  remaining high-risk flows.
- Review privacy, webhook signatures, payment secrets, and role escalation risks.
- Add deployment, environment variable, rollback, and support documentation.
- Verify responsive UI, empty states, loading states, and error states.

Acceptance:

- Full checks pass in a production-like environment.
- No known privacy, payment, or role-permission launch blockers remain.

## Phase 9: Post-MVP Growth

- WhatsApp reminders.
- Installable PWA or mobile app.
- Rich impact reports.
- Foundation payout automation.
- Donor receipt exports.
- Multi-currency and region-aware payment routing.
