# Architecture

Al-Infaaq follows the PlotKeys workspace pattern:

- `apps/web`: Next.js App Router interface.
- `apps/api`: Hono HTTP server with tRPC routers.
- `packages/auth`: session, role, and permission helpers.
- `packages/db`: schema ownership and database runtime configuration.
- `packages/jobs`: scheduled work entrypoints.
- `packages/payments`: provider adapters for Paystack and Lemon Squeezy.
- `packages/ui`: shared interface primitives and global styling.
- `packages/utils`: shared formatting and runtime helpers.

App code should prefer shared packages over local duplicate helpers. Payment provider
secrets stay server-side, and foundations never receive spender identity fields.
