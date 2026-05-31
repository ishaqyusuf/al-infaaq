# Permissions

Roles are defined in `packages/utils/src/roles.ts` and permissions in
`packages/auth/src/permissions.ts`.

- `spender`: create donations, read own donation history, and submit a
  foundation profile for Trustee review as the first step of foundation
  onboarding.
- `foundation`: apply for Trustee review and publish requests after approval.
- `trustee`: approve or reject foundation review requests.
- `admin`: manage all platform operations.

The public foundation surface must never expose spender names, emails, phone
numbers, or account identifiers.

## Web Route Boundaries

Private App Router pages must declare their role checks at the page boundary:

- `/admin`: admin only.
- `/trustee/reviews`: Trustee or admin.
- `/foundation/requests`, `/foundation/requests/[id]/banner`, and
  `/foundation/requests/[id]/report`: foundation or admin.
- `/foundations/apply`: spender or foundation.
- `/goals`, `/wallet`, and `/donate`: spender or admin.
- `/dashboard`: authenticated session plus tRPC-owned onboarding routing.

Web architecture tests must keep these route-level checks aligned with the API
permission matrix.
