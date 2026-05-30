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
