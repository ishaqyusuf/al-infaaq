# Deployment Runbook

This runbook is for the first stable Al-Infaaq deployment path. The production
domain direction is `alinfaaq`; confirm the final TLD before creating public
URLs, webhook endpoints, or payment provider callback settings.

## Required Stack

- Bun workspace install.
- PostgreSQL database reachable from the web and API runtimes.
- Better Auth secret and public auth/API origins.
- Paystack and Lemon Squeezy credentials before enabling real collections.

## Environment Checklist

App:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `WEB_APP_URL`
- `API_ORIGIN`
- `API_PORT`

Auth:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` when the hosting environment requires an explicit auth URL.

Database:

- `DATABASE_PROVIDER=postgres`
- `DATABASE_URL`

Payments:

- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_WEBHOOK_SECRET`
- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_DONATION_VARIANT_ID`
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_WEBHOOK_SECRET`

## Preflight

Run these against the exact build and environment intended for deployment:

```bash
bun install
bun run db:generate
bun run db:migrate:deploy
bun run test
bun run lint
bun run typecheck
bun run build
```

## Webhook Setup

Configure provider dashboards with production webhook URLs:

- Paystack: `/api/payments/paystack/webhook`
- Lemon Squeezy: `/api/payments/lemonsqueezy/webhook`

Provider checkout initialization must continue through `donations.start`; do not
add raw provider initialization routes that bypass pending donation persistence.

## Privacy Checks

- Public pages expose request details, foundation identity, and aggregate totals
  only.
- Foundation request reporting uses aggregate metrics only and never includes
  spender identity fields.
- Admin reconciliation may inspect provider references and statuses, but public
  and foundation views must stay anonymous.
- Trustee review approves foundation legitimacy; Trustees do not manage funds.

## Rollback

1. Pause payment provider webhooks if payment correctness is affected.
2. Revert web/API runtimes to the previous known-good build.
3. Keep audit logs and donation records intact for incident review.
4. Apply database rollback only after confirming whether the failed release wrote
   production data.
5. Re-run `bun run test`, `bun run typecheck`, and `bun run build` after the
   rollback build is selected.
