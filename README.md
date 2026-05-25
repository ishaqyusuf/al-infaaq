# Al-Infaaq

Bun + Turbo monorepo for anonymous sadaqah giving.

## Apps

- `apps/web`: Next.js web app for spenders, foundations, Sheikh verifiers, and admins.
- `apps/api`: Hono + tRPC API for health checks, payment orchestration, and domain workflows.

## Packages

- `packages/auth`: Role, session, and permission helpers.
- `packages/db`: Database runtime configuration and Prisma schema ownership.
- `packages/jobs`: Scheduled job entrypoints such as monthly giving reminders.
- `packages/payments`: Paystack and Lemon Squeezy integration helpers.
- `packages/ui`: Shared UI primitives used by app surfaces.
- `packages/utils`: Shared formatting, role labels, URL, and money helpers.
- `packages/tsconfig`: Shared TypeScript configuration.

## Development

```bash
bun install
bun run dev
```

Copy `.env.example` to `.env.local` and fill in Paystack and Lemon Squeezy keys before testing payment routes.

## Launch Checks

```bash
bun run db:generate
bun run db:migrate:deploy
bun run lint
bun run typecheck
bun run build
```

See `brain/system/launch-readiness.md` for environment variables, webhook
checks, privacy boundaries, and rollback notes.

## Current Product Direction

Al-Muhsinoon can set monthly sadaqah goals and donate anonymously to verified foundations. Foundations publish requests and generate shareable QR-backed solicitation banners. Trusted Sheikh verifier accounts approve foundations before they can collect public donations.
