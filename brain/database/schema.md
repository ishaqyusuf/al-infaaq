# Database Schema

The Prisma schema in `packages/db/prisma/schema.prisma` owns the core domain:

- `User`
- `SpenderProfile`
- `Foundation`
- `TrusteeReview`
- `DonationRequest`
- `Donation`
- `SpendingGoal`
- `Reminder`
- `FundraisingBanner`
- `AuditLog`

The schema preserves anonymous giving by linking donations internally while exposing
only aggregate request/foundation totals to foundations.
