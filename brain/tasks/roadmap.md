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

## Phase 1: Better Auth and Access Control

- Complete Better Auth email/password sign-in and sign-up UI.
- Add role-aware sign-in/onboarding for spenders, foundations, Trustees,
  and admins.
- Enforce permissions in API procedures and protected web routes.
- Add profile-completion redirects for new users.
- Record audit logs for privileged actions.

Acceptance:

- Every role can access its own dashboard and is blocked from other roles'
  private workflows.
- Permission checks cover both API and UI entrypoints.

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
