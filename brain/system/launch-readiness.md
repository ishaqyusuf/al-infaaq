# Launch Readiness

## Required Environment

- `DATABASE_PROVIDER=postgres`: Prisma provider for local and deployed
  PostgreSQL environments.
- `DATABASE_URL`: PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: long random secret for Better Auth.
- `AL_INFAAQ_ADMIN_EMAILS` and `AL_INFAAQ_TRUSTEE_EMAILS`: comma-separated
  existing Better Auth users to promote during launch provisioning.
- `BETTER_AUTH_URL` or `API_ORIGIN`: public API/auth origin.
- `API_PORT`: API server port for local and preview runs.
- `WEB_APP_URL` and `NEXT_PUBLIC_APP_URL`: public web origin.
- `NEXT_PUBLIC_API_URL`: browser-facing API origin.
- Production public origins should use the `alinfaaq` domain direction. The
  final TLD is a deployment decision and must be set consistently across app,
  auth, API, webhook, and provider callback URLs before launch.
- Web, API, Better Auth, tRPC, and generated-link code should resolve origins
  through the shared runtime URL helpers so Vercel previews, same-origin proxy
  deployments, portless local URLs, and localhost fallbacks stay consistent.
- `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, and `PAYSTACK_WEBHOOK_SECRET`
  when Paystack collections are enabled.
- `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`,
  `LEMONSQUEEZY_DONATION_VARIANT_ID`, and `LEMONSQUEEZY_WEBHOOK_SECRET` when
  Lemon Squeezy checkout is enabled.

## Verification Commands

- `bun run db:generate`
- `bun run db:migrate:deploy`
- `bun run test`
- `bun run test:e2e`
- `bun run lint`
- `bun run typecheck`
- `bun run build`
- `bun run roles:provision` after the initial admin and Trustee users have
  signed up.
- Role provisioning must fail before mutation for unknown Better Auth users,
  preserve admin precedence when an email appears in both admin and Trustee
  lists, and write `user.role_provisioned` audit logs for each promotion.
- Playwright E2E must cover public runtime rendering, the unknown-route
  catch-all redirect, Better Auth sign-up/sign-in, spender onboarding,
  foundation Trustee-review onboarding, Trustee workspace access, admin
  workspace access, spender goal saves, foundation profile submission for
  Trustee review, Trustee approval, foundation request creation/publishing,
  public request rendering, QR-backed banner generation/download links, and
  anonymous Paystack checkout completion with private wallet history, anonymous
  Lemon Squeezy checkout completion through a signed webhook, plus admin
  payout-readiness/trust-operations rendering, privacy-safe request impact
  reports, unapproved foundation denial from admin operations, and
  mobile/desktop responsive layout checks for public runtime surfaces.
- Responsive checks must prove public pages render in dark mode without
  page-level horizontal overflow, collapsed visible text, or missing primary
  content on mobile and desktop viewport widths.

The contributor-facing deployment runbook lives in `docs/deployment.md`.
DB-backed App Router pages must use dynamic rendering so deployment builds do
not query production data before migrations have run.
Tracked migration SQL uses Trustee language from the initial migration. Fresh
production databases can apply it directly; older local development databases
that applied pre-normalized migrations should be reset locally.

## Privacy Checks

- Public request pages must expose foundation identity, request story, and
  aggregate totals only.
- Foundation dashboards must never show spender names, emails, account IDs, or
  provider customer identifiers.
- Donation records can link spenders internally for receipts, reconciliation,
  fraud review, and private wallet history.
- Trustee review approves foundation legitimacy; Trustees do not manage funds.

## Payment Checks

- Paystack webhooks must verify `x-paystack-signature` with HMAC-SHA512.
- Lemon Squeezy webhooks must verify `x-signature` with HMAC-SHA256.
- Donation checkout must fail before pending donation creation when required
  provider configuration is missing.
- Webhook handlers must return controlled `401`, `400`, or `503` responses for
  invalid signatures, malformed signed JSON, and missing webhook secret
  configuration.
- Donation totals must update only from verified successful provider events.
- Duplicate webhook deliveries must not double-count raised totals.
- Refund events must move donations to `REFUNDED` and decrement request totals
  only if the donation was previously successful.
- Admin trust operations must surface payout-readiness summaries, stale pending
  donations, and high-value successful donations without exposing donor identity
  to foundations.
- Admin incident review must surface suspended foundations, failed/refunded
  reconciliation items, stale pending payments, and high-value successful gifts
  without requiring direct database access.
- Foundation request impact reports must expose aggregate progress, donation
  status counts, and banner counts without exposing spender identity.
- Monthly reminder queueing and due email delivery must respect spender
  `remindersEnabled` preferences, including profiles that opt out after a
  reminder was already queued.

## Rollback

- Pause payment provider webhooks first if payment correctness is affected.
- Revert the web/API deployment to the previous known-good build.
- Use Prisma migration rollback procedures only after confirming whether the
  failed release wrote production data.
- Keep audit logs intact during incident review.
