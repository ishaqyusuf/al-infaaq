# Roadmap

This roadmap defines the path to 100% product completion for the first stable
release. A phase is complete only when its user flows, API/database behavior,
permissions, tests, and documentation are all done.

## Phase 0: Foundation and Architecture

Status: mostly complete.

- Bun + Turbo monorepo with `apps/*`, `packages/*`, and `brain/*` boundaries.
- Next.js web app shell and Hono + tRPC API shell.
- Shared packages for auth, database, payments, jobs, UI, and utilities.
- PostgreSQL Docker service, Prisma 7 config, generated client, and initial
  migration applied.
- Baseline product dashboard showing spender, foundation, Trustee review, payment,
  reminder, and banner concepts.

Done when:

- `bun run typecheck` passes.
- `bun run db:generate` passes.
- `bun run db:migrate` applies the initial schema cleanly on a fresh database.

## Phase 1: Better Auth and Access Control

- Use Better Auth for production authentication.
- Support spender, foundation, Trustee, and admin role assignment.
- Protect web pages and API procedures with permission checks.
- Maintain onboarding redirects for incomplete spender and foundation profiles.
- Add audit events for privileged admin and Trustee actions.

Done when:

- Each role can sign in, reach only its allowed surfaces, and is blocked from
  forbidden actions.
- Public foundation/request pages never expose spender identity fields.

## Phase 2: Foundation Onboarding and Trustee Review

- Build foundation profile creation and edit flow.
- Let foundations submit Trustee review requests with required profile/document
  metadata.
- Build Trustee review queue with approve/reject decisions and notes.
- Build admin oversight for pending, approved, rejected, and suspended
  foundations.
- Prevent unapproved foundations from publishing public donation requests.

Done when:

- A foundation can move from draft to pending Trustee review to approved.
- Rejected and suspended foundations cannot collect public donations.
- Trustee review decisions are stored and visible to the right roles.

## Phase 3: Donation Requests and Public Giving Pages

- Build foundation request creation, draft, publish, archive, and funded states.
- Build public request pages with progress, foundation trust status, and clear
  donation calls to action.
- Show only aggregate donation totals to foundations and the public.
- Add request search/list views for spenders.
- Keep request status transitions consistent between UI, API, and database.

Done when:

- Approved foundations can publish requests.
- Spenders can browse and open public request pages.
- Public surfaces expose no private spender data.

## Phase 4: Payments, Webhooks, and Reconciliation

- Complete Paystack initialization, callback verification, and webhook handling.
- Complete Lemon Squeezy checkout creation and webhook handling.
- Persist pending, succeeded, failed, refunded, provider, reference, amount, and
  request/foundation links for every donation.
- Update request raised totals from verified provider events only.
- Add idempotency for duplicate provider webhook deliveries.
- Add admin reconciliation views for mismatched or failed provider events.

Done when:

- Test donations can complete end to end through both providers.
- Duplicate webhooks do not double-count donations.
- Payment failures and refunds are reflected in donation status and totals.

## Phase 5: Spender Goals, Wallet, and Reminders

- Build spender monthly goal setup and edit flow.
- Build private giving wallet/history with optional hidden-history display mode.
- Track progress against monthly goals from successful donations.
- Add email reminders and scheduled monthly reminder job.
- Add reminder preferences and unsubscribe/disable behavior.

Done when:

- Al-Muhsinoon can set goals, donate, and see private progress.
- Monthly reminders are queued and sent only according to user preferences.

## Phase 6: QR-Backed Banner Generation

- Convert the existing QR metadata route into a full banner composition flow.
- Store generated fundraising banner records for donation requests.
- Let foundations generate, preview, and download/share request banners.
- Ensure QR codes resolve to the correct public request page.

Done when:

- A foundation can generate a banner for a published request.
- Scanning the QR code opens the request page with the correct request ID.

## Phase 7: Admin, Reporting, and Trust Operations

- Add admin dashboard for users, foundations, requests, donations, and audit
  logs.
- Add foundation payout readiness and reconciliation reporting.
- Add request impact reports for funded or archived requests.
- Add operational filters for suspicious donation/payment activity.
- Add support workflows for suspending foundations and reviewing incidents.

Done when:

- Admins can investigate core platform activity without direct database access.
- Foundations can understand request performance without seeing donor identities.

## Phase 8: QA, Security, and Launch Readiness

- Add unit/integration coverage for auth, permissions, payments, webhooks,
  request status transitions, and reminder jobs.
- Add end-to-end tests for the core spender, foundation, Trustee, and
  admin flows.
- Review privacy boundaries, payment secret handling, webhook signatures, and
  role escalation risks.
- Add production deployment documentation, environment variable checklist, and
  rollback steps.
- Verify responsive UI, empty states, loading states, and error states.

Done when:

- The full test suite passes.
- A fresh production-like environment can be deployed from documentation.
- No known privacy or payment correctness blockers remain.

## Phase 9: Post-MVP Growth

- WhatsApp reminders.
- Installable PWA or mobile app.
- Rich request impact reports with media updates.
- Foundation payout automation.
- Donor receipt exports.
- Multi-currency and region-aware payment routing.
