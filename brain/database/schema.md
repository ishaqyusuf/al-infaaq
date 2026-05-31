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

`SpenderProfile` stores private donor controls, including monthly goal amount,
wallet history visibility, preferred reminder channel, and the
`remindersEnabled` opt-in used by reminder queueing and email delivery.
