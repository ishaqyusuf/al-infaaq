# API Endpoints

## HTTP

- `GET /` - API status payload.
- `GET /health` - API, auth, database, and timestamp status.
- `GET|POST /api/auth/*` - Better Auth handler for session, sign-in, sign-up,
  and account endpoints.
- `GET|POST /trpc/*` - tRPC transport.

## tRPC Routers

- `health.status`
- `payments.initializePaystack`
- `payments.createLemonSqueezyCheckout`

Next.js route handlers in `apps/web` currently expose local payment and banner
entrypoints for the web surface while the API workspace owns the long-term backend
shape.
