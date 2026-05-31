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
- API workflow tests call real tRPC procedures with mocked database/payment
  boundaries for Trustee decisions, admin status changes, request lifecycle
  guards, and donation checkout persistence.

## Foundation Submit For Review

Input:

- `name`
- `description`
- `contactEmail`
- `registrationNumber`
- `websiteUrl`
- `documentUrl`

Behavior:

- Spender and foundation accounts can submit a foundation profile for Trustee
  review.
- Upserts the caller's foundation profile.
- Moves the foundation to `PENDING_REVIEW`.
- Creates a pending Trustee review when one does not already exist.
- Promotes the caller to the foundation role.
- Writes a foundation submission audit log.
- The web form must validate and trim profile metadata before calling the tRPC
  mutation, including required name/description and full URL/email formats.

## Trustee Review Decision

Input:

- `reviewId`
- `notes`

Behavior:

- Trustees and admins can approve or reject foundation reviews.
- Approval moves the foundation to `APPROVED`.
- Rejection moves the foundation to `REJECTED`.
- Decision notes, reviewer, decision time, and audit logs are stored.
- Missing review records must fail before review, foundation, or audit rows are
  changed.

## Admin Foundation Status

Behavior:

- `admin.suspendFoundation` moves a foundation to `SUSPENDED`.
- `admin.restoreFoundation` moves a foundation back to `APPROVED`.
- Both privileged admin mutations write audit logs with the acting admin and
  target foundation.
- Workflow tests must cover both suspension and restoration.

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
- Publishing stores a publish timestamp, moves the request to `PUBLISHED`, and
  writes an audit log.
- Publishing a non-draft request is rejected.
- Archiving is owner-scoped, writes an audit log on the first transition, and
  is idempotent when the request is already archived.
- Publishing is blocked for unapproved foundations.
- Public request reads include published and funded requests; funded requests
  remain visible but should not show a donation CTA.
- Public request reads, checkout starts, request publishing, and banner
  generation must all require an approved foundation.
- Donation checkout starts are allowed only for currently published requests;
  funded, archived, draft, rejected-foundation, and suspended-foundation requests
  are not donation targets.
- Workflow tests must prove funded requests remain publicly readable while
  checkout starts stay blocked for funded, archived, unavailable, rejected
  foundation, and suspended foundation requests.

## Spender Goal Save

Input:

- `monthlyGoalNaira`
- `reminderChannel`
- `remindersEnabled`
- `showSpendingHistory`

Behavior:

- Upserts the caller's spender profile.
- Stores goal history and replaces future unsent reminders when the goal is
  positive.
- Clears future unsent reminders when the goal is set to zero.
- Zero-goal saves must not create new goal-history or reminder rows.
- Positive-goal saves keep goal history even when reminders are disabled, but
  must not queue new reminder rows while `remindersEnabled` is false.
- Writes a goal saved audit log.
- The web form must validate the monthly goal, reminder channel, reminder
  opt-in, and wallet visibility preference before calling the tRPC mutation,
  while allowing zero-goal saves.

## Onboarding Next Step

Behavior:

- `onboarding.nextStep` is a protected tRPC query used by the dashboard to
  resolve role-aware next steps.
- Spenders without a positive monthly goal are redirected to `/goals`.
- Foundations without an approved foundation profile are redirected to
  `/foundations/apply`.
- Approved foundations continue to `/foundation/requests`.
- Trustees and admins are treated as complete and receive their role workspaces.
- The web dashboard must use this tRPC contract instead of importing Prisma or
  duplicating profile-completion rules.
- Workflow tests must cover spender incomplete/complete states, incomplete
  foundation statuses, approved foundation routing, and Trustee/admin workspace
  routing.
- Private web routes must declare page-level role boundaries that match the API
  permission matrix; architecture tests enforce the expected role arrays for
  admin, Trustee, foundation, spender wallet/goal/donation, and foundation
  onboarding pages.

## Reminder Jobs

Behavior:

- Monthly reminder queueing is idempotent per user/channel/reminder date.
- Monthly reminder queueing only includes spender profiles with a positive goal
  and `remindersEnabled`.
- Email reminder delivery is processed from due unsent `Reminder` rows and marks
  only successfully delivered rows as sent.
- Due email delivery re-checks the spender profile before sending so reminders
  disabled after queueing are skipped and left unsent.
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
- Dedicated request impact reporting is sourced from `requests.impactReport`.
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
- Workflow tests must prove pending donation persistence happens before the
  provider checkout URL is returned.
- The web donation form must validate amount, provider, and request identity
  before calling this tRPC mutation so invalid input never reaches checkout
  initialization.

## Payment Webhook State Transitions

Behavior:

- Paystack and Lemon Squeezy webhooks update persisted donations through the
  shared payment state helpers.
- Success events are idempotent for already-succeeded donations.
- First success marks the donation `SUCCEEDED`, increments the linked request's
  `raisedKobo`, and moves published requests to `FUNDED` when the target is met.
- Refund events are idempotent for already-refunded donations.
- Refunds of successful donations decrement `raisedKobo` and reopen funded
  requests to `PUBLISHED` when the raised total drops below target.
- Failure events only move pending donations to `FAILED`.
- Workflow tests must prove these status and aggregate-total transitions.
- Paystack and Lemon Squeezy route handlers reject invalid signatures before
  touching donation state.
- Webhook route handlers return controlled errors for missing webhook secrets
  and malformed signed JSON instead of throwing uncaught runtime errors.
- Route-level tests must prove signed provider events call the persisted
  donation transition path.

## Admin Dashboard Reporting

Behavior:

- Admin dashboard data comes from the `admin.dashboard` tRPC query.
- Admin reporting includes all-time successful donation totals, donation status
  counts, provider-level successful totals, and a reconciliation queue for
  pending, failed, and refunded donations.
- Admin reporting includes an incident review queue derived from suspended
  foundations, failed/refunded reconciliation items, stale pending payments, and
  high-value successful gifts.
- Workflow tests must prove zero-filled donation status counts, provider totals,
  successful totals, the pending/failed/refunded reconciliation filter, and
  incident review item construction.
- Reconciliation views must not expose spender identity to foundations or public
  surfaces.
