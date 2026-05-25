# API Contracts

Product workflow mutations are exposed through typed tRPC routers. Next server
actions should not own product domain mutations.

## Read Procedure Boundaries

Behavior:

- Server-rendered web pages should call tRPC procedures through the server tRPC
  caller instead of importing Prisma directly.
- Public request listing/detail reads are public tRPC queries.
- Private dashboard, wallet, foundation, Trustee, and admin reads are protected
  tRPC queries using the same permission boundaries as mutations.
- Direct Prisma access in the web app is reserved for framework-required route
  handlers such as webhooks and generated banner responses.

Test coverage:

- Web architecture tests enforce no product server actions and no direct Prisma
  imports in page components.
- API contract tests enforce tRPC router registration and funded public request
  visibility.

## Foundation Submit For Review

Input:

- `name`
- `description`
- `contactEmail`
- `registrationNumber`
- `websiteUrl`
- `documentUrl`

Behavior:

- Upserts the caller's foundation profile.
- Moves the foundation to `PENDING_REVIEW`.
- Creates a pending Trustee review when one does not already exist.
- Promotes the caller to the foundation role.
- Writes a foundation submission audit log.

## Trustee Review Decision

Input:

- `reviewId`
- `notes`

Behavior:

- Trustees and admins can approve or reject foundation reviews.
- Approval moves the foundation to `APPROVED`.
- Rejection moves the foundation to `REJECTED`.
- Decision notes, reviewer, decision time, and audit logs are stored.

## Donation Request Lifecycle

Input:

- `title`
- `story`
- `targetNaira`
- `requestId`

Behavior:

- Approved foundations can create draft requests.
- Request owners and admins can publish drafts.
- Request owners and admins can archive requests.
- Publishing is blocked for unapproved foundations.
- Public request reads include published and funded requests; funded requests
  remain visible but should not show a donation CTA.

## Spender Goal Save

Input:

- `monthlyGoalNaira`
- `reminderChannel`
- `showSpendingHistory`

Behavior:

- Upserts the caller's spender profile.
- Stores goal history and replaces future unsent reminders when the goal is
  positive.
- Clears future unsent reminders when the goal is set to zero.
- Writes a goal saved audit log.

## Reminder Jobs

Behavior:

- Monthly reminder queueing is idempotent per user/channel/reminder date.
- Email reminder delivery is processed from due unsent `Reminder` rows and marks
  only successfully delivered rows as sent.
- Real email providers are injected into the job; the core job logic stays
  provider-neutral and testable.

## Fundraising Banner Generation

Behavior:

- Banner generation is a protected `requests.generateBanner` tRPC mutation for
  approved foundations and admins.
- Only published donation requests can generate new QR-backed banners.
- Generated banner records store the composed SVG data URL and QR data URL in
  `FundraisingBanner`.
- The web banner route serves the latest stored generated asset for download and
  should not create banner records itself.

## Foundation Request Reporting

Behavior:

- Foundation request workspace reporting is sourced from
  `requests.foundationWorkspace`.
- Request performance includes aggregate progress, remaining amount, donation
  status counts, completed amount, and generated banner count.
- Foundation reporting must not include spender records or spender identity
  fields.

## Donation Start

Input:

- `requestId`
- `amountNaira`
- `provider`

Behavior:

- Creates a pending anonymous donation for a published request from an approved
  foundation.
- Returns a provider checkout URL for the web client to navigate to.
- Foundation surfaces only receive aggregate donation progress.
- This is the only product checkout initialization entrypoint; raw provider
  checkout procedures and route handlers should not bypass donation persistence.

## Admin Dashboard Reporting

Behavior:

- Admin dashboard data comes from the `admin.dashboard` tRPC query.
- Admin reporting includes all-time successful donation totals, donation status
  counts, provider-level successful totals, and a reconciliation queue for
  pending, failed, and refunded donations.
- Reconciliation views must not expose spender identity to foundations or public
  surfaces.
