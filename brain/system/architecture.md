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

Frontend surfaces should use a clean shadcn-standard design system: shared
tokens, accessible primitives, consistent component variants, and restrained
dashboard layouts. New UI should avoid one-off styling when a shared shadcn-style
primitive or pattern can carry the interaction.

Domain reads and mutations should be exposed through typed tRPC routers. Avoid
adding new Next server actions for product workflows; migrate existing server
actions behind tRPC procedures as phases are completed.
