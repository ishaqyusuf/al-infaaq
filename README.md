# Al-Infaaq

![Al-Infaaq GitHub README hero](apps/web/public/github-readme-hero.png)

Anonymous sadaqah giving for Trustee-reviewed foundations.

Al-Infaaq is an in-progress Bun + Turbo monorepo for building a private giving
platform. Al-Muhsinoon can set monthly sadaqah goals, donate without public
recognition, and keep a private giving wallet. Foundations can publish verified
needs, generate QR-backed fundraising banners, and collect donations only after
Trustee review.

Domain direction: `alinfaaq` for the public web presence. The final TLD is still
to be confirmed before launch.

## Current Status

This repository is moving toward the first stable release. The core monorepo,
database schema, Better Auth integration, payment provider boundaries, and first
product surfaces are being built in phases.

The current product direction is:

- Al-Muhsinoon donate anonymously and track private monthly progress.
- Foundations submit profiles for Trustee review before collecting donations.
- Trustees approve foundation legitimacy; they do not manage funds.
- Public request pages and banners show aggregate progress, not donor identity.
- Admins monitor users, foundations, donations, requests, and audit activity.

See [brain/product/roadmap.md](brain/product/roadmap.md) for the full phase
roadmap.

## Architecture

Al-Infaaq uses a Bun workspace monorepo orchestrated by Turbo.

| Path | Purpose |
| --- | --- |
| `apps/web` | Next.js App Router web app for spenders, foundations, Trustees, and admins. |
| `apps/api` | Hono + tRPC API for health checks, payment orchestration, and domain workflows. |
| `packages/auth` | Better Auth server setup, role helpers, sessions, and permissions. |
| `packages/db` | Prisma schema ownership, generated client, and database runtime config. |
| `packages/jobs` | Scheduled job entrypoints such as monthly giving reminders. |
| `packages/payments` | Paystack and Lemon Squeezy provider adapters and webhook helpers. |
| `packages/ui` | Shared UI primitives used by app surfaces. |
| `packages/utils` | Shared formatting, role labels, URL helpers, and money utilities. |
| `packages/tsconfig` | Shared TypeScript configuration. |

The Prisma schema owns the core domain: users, spender profiles, foundations,
Trustee reviews, donation requests, donations, goals, reminders, banners, and
audit logs.

## Local Setup

Required local stack:

- Bun `1.3.9`
- Docker with Compose
- PostgreSQL via `docker-compose.yml`

Install dependencies:

```bash
bun install
```

Create local environment variables:

```bash
cp .env.example .env.local
```

For local Postgres, use:

```env
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/al_infaaq
```

Start Postgres and prepare Prisma:

```bash
bun run db:up
bun run db:generate
bun run db:migrate
```

Run the apps:

```bash
bun run dev
```

Or run one surface at a time:

```bash
bun run dev:web
bun run dev:api
```

## Environment

Copy `.env.example` to `.env.local` for local development.

| Group | Variables |
| --- | --- |
| App origins | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, `WEB_APP_URL`, `API_ORIGIN`, `API_PORT` |
| Auth | `BETTER_AUTH_SECRET` |
| Database | `DATABASE_PROVIDER`, `DATABASE_URL` |
| Paystack | `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET` |
| Lemon Squeezy | `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_DONATION_VARIANT_ID`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_WEBHOOK_SECRET` |

Payment keys can stay empty while working on non-payment flows. Webhook routes
must use real provider secrets before payment testing.

## Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Run all development surfaces through Turbo. |
| `bun run dev:web` | Run only the Next.js web app. |
| `bun run dev:api` | Run only the Hono API app. |
| `bun run typecheck` | Typecheck all workspaces. |
| `bun run lint` | Lint all workspaces. |
| `bun run test` | Run Bun tests across workspaces through Turbo. |
| `bun run build` | Build all workspaces. |
| `bun run db:up` | Start the local Docker Postgres service. |
| `bun run db:down` | Stop the local Docker Postgres service. |
| `bun run db:logs` | Tail local Postgres logs. |
| `bun run db:generate` | Generate the Prisma client from `packages/db/prisma/schema.prisma`. |
| `bun run db:migrate` | Apply development Prisma migrations. |
| `bun run db:migrate:deploy` | Apply migrations in deploy-style environments. |
| `bun run db:studio` | Open Prisma Studio for local inspection. |

## Verification

Run these before shipping a change:

```bash
bun run db:generate
bun run db:migrate
bun run test
bun run typecheck
bun run lint
bun run build
```

For deployment readiness, also review
[brain/system/launch-readiness.md](brain/system/launch-readiness.md) and the
[deployment runbook](docs/deployment.md).

## Privacy And Trust

Al-Infaaq is designed around private giving and operational accountability.

- Foundations and public request pages must never expose spender names, emails,
  account IDs, or provider customer identifiers.
- Donation records may link spenders internally for receipts, reconciliation,
  fraud review, and private wallet history.
- Trustees review foundation legitimacy before public collection is enabled.
- Trustees do not manage foundation funds.
- Payment totals should update only from verified successful provider events.
- Admin and Trustee actions should be auditable.

## Roadmap

The first stable release is organized around these phases:

1. Foundation and architecture.
2. Better Auth and access control.
3. Foundation onboarding and Trustee review.
4. Donation requests and public giving pages.
5. Payments, webhooks, and reconciliation.
6. Spender goals, wallet, and reminders.
7. QR-backed banner generation.
8. Admin, reporting, and trust operations.
9. QA, security, and launch readiness.

Post-MVP ideas include WhatsApp reminders, installable app support, richer
impact reports, payout automation, donor receipt exports, and multi-currency
payment routing.
