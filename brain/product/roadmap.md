# Roadmap

This roadmap defines the path to 100% product completion for the first stable
release. A phase is complete only when its user flows, API/database behavior,
permissions, tests, and documentation are all done.

## Phase 0: Foundation and Architecture

Status: complete for MVP code readiness.

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

Status: complete for MVP code readiness.

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

Status: complete for MVP code readiness.

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

Status: complete for MVP code readiness.

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

Status: complete for MVP code readiness; production provider credentials and
webhook registrations remain launch-environment gates.

- Complete Paystack initialization, callback verification, and webhook handling.
- Complete Lemon Squeezy checkout creation and webhook handling.
- Persist pending, succeeded, failed, refunded, provider, reference, amount, and
  request/foundation links for every donation.
- Update request raised totals from verified provider events only.
- Add idempotency for duplicate provider webhook deliveries.
- Add admin reconciliation views for mismatched or failed provider events.
- Current E2E coverage completes an anonymous Paystack checkout through callback
  verification and an anonymous Lemon Squeezy checkout through a signed webhook
  event against the local payment provider harness.

Done when:

- Test donations can complete end to end through both providers.
- Duplicate webhooks do not double-count donations.
- Payment failures and refunds are reflected in donation status and totals.

## Phase 5: Spender Goals, Wallet, and Reminders

Status: complete for MVP code readiness; production email/SMS/WhatsApp delivery
providers remain launch-environment gates beyond the tested reminder job
boundary.

- Build spender monthly goal setup and edit flow.
- Build private giving wallet/history with optional hidden-history display mode.
- Track progress against monthly goals from successful donations.
- Add email reminders and scheduled monthly reminder job.
- Add reminder preferences and unsubscribe/disable behavior.
- Current implementation includes explicit `remindersEnabled` opt-out behavior
  across the goal form, tRPC save flow, monthly queueing, and due email
  processing.

Done when:

- Al-Muhsinoon can set goals, donate, and see private progress.
- Monthly reminders are queued and sent only according to user preferences.

## Phase 6: QR-Backed Banner Generation

Status: complete for MVP code readiness.

- Convert the existing QR metadata route into a full banner composition flow.
- Store generated fundraising banner records for donation requests.
- Let foundations generate, preview, and download/share request banners.
- Ensure QR codes resolve to the correct public request page.

Done when:

- A foundation can generate a banner for a published request.
- Scanning the QR code opens the request page with the correct request ID.

## Phase 7: Admin, Reporting, and Trust Operations

Status: complete for MVP code readiness.

- Add admin dashboard for users, foundations, requests, donations, and audit
  logs.
- Add foundation payout readiness and reconciliation reporting.
- Add privacy-safe request impact reports for funded or archived requests.
- Add operational filters for suspicious donation/payment activity.
- Add support workflows for suspending foundations and reviewing incidents.
- Current admin dashboard includes payout readiness, reconciliation, trust
  operations, and an incident review queue derived from suspended foundations,
  failed/refunded donations, stale pending payments, and high-value gifts.

Done when:

- Admins can investigate core platform activity without direct database access.
- Foundations can understand request performance and impact without seeing donor
  identities.

## Phase 8: QA, Security, and Launch Readiness

Status: complete for local production-like verification; live deployment,
provider secrets, DNS/TLD choice, and webhook registration remain external
launch gates.

- Add unit/integration coverage for auth, permissions, payments, webhooks,
  request status transitions, and reminder jobs.
- Add end-to-end tests for the core spender, foundation, Trustee, and
  admin flows.
- Keep `bun run test:e2e` green for public runtime rendering, role onboarding,
  spender goal saves, foundation Trustee-review submission, Trustee approval,
  foundation request publishing, public request rendering, QR-backed banner
  generation, anonymous Paystack checkout completion, anonymous Lemon Squeezy
  webhook completion, private wallet history, admin
  payout-readiness/trust-operations rendering, privacy-safe request impact
  reports, protected-route denial checks, and mobile/desktop responsive layout
  checks against local Docker Postgres.
- Review privacy boundaries, payment secret handling, webhook signatures, and
  role escalation risks.
- Add production deployment documentation, environment variable checklist, and
  rollback steps.
- Verify responsive UI, empty states, loading states, and error states.
- Responsive UI verification must include mobile and desktop checks for public
  surfaces, no page-level horizontal overflow, visible primary content, and
  non-collapsed visible text.

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
