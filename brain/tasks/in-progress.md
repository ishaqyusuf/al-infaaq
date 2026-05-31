# In Progress

Current implementation state: MVP code readiness is verified locally.

## Active Gate

- Prepare live launch environment after the final `alinfaaq` TLD is selected.

## External Launch Inputs

- Production database URL and migration target.
- Better Auth production secret and public auth origin.
- Final `alinfaaq` domain/TLD and callback origins.
- Paystack keys and webhook secret.
- Lemon Squeezy keys, store, donation variant, and webhook secret.
- Email/SMS/WhatsApp sender configuration for reminder delivery beyond the
  tested job boundary.

## Current Verification Baseline

- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run build`
- `bun run test:e2e`
