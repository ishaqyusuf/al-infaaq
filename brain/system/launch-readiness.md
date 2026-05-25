# Launch Readiness

## Required Environment

- `DATABASE_URL`: PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: long random secret for Better Auth.
- `AL_INFAAQ_ADMIN_EMAILS` and `AL_INFAAQ_TRUSTEE_EMAILS`: comma-separated
  existing Better Auth users to promote during launch provisioning.
- `BETTER_AUTH_URL` or `API_ORIGIN`: public API/auth origin.
- `WEB_APP_URL` and `NEXT_PUBLIC_APP_URL`: public web origin.
- `NEXT_PUBLIC_API_URL`: browser-facing API origin.
- Production public origins should use the `alinfaaq` domain direction.
  TODO: confirm the final TLD before deployment.
- `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, and `PAYSTACK_WEBHOOK_SECRET`
  when Paystack collections are enabled.
- `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`,
  `LEMONSQUEEZY_DONATION_VARIANT_ID`, and `LEMONSQUEEZY_WEBHOOK_SECRET` when
  Lemon Squeezy checkout is enabled.

## Verification Commands

- `bun run db:generate`
- `bun run db:migrate:deploy`
- `bun run test`
- `bun run lint`
- `bun run typecheck`
- `bun run build`
- `bun run roles:provision` after the initial admin and Trustee users have
  signed up.

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
- Donation totals must update only from verified successful provider events.
- Duplicate webhook deliveries must not double-count raised totals.
- Refund events must move donations to `REFUNDED` and decrement request totals
  only if the donation was previously successful.

## Rollback

- Pause payment provider webhooks first if payment correctness is affected.
- Revert the web/API deployment to the previous known-good build.
- Use Prisma migration rollback procedures only after confirming whether the
  failed release wrote production data.
- Keep audit logs intact during incident review.
