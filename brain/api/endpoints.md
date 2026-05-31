# API Endpoints

## HTTP

- `GET /` - API status payload.
- `GET /health` - API, auth, database, and timestamp status.
- `GET|POST /api/auth/*` - Better Auth handler for session, sign-in, sign-up,
  and account endpoints.
- `GET|POST /trpc/*` - tRPC transport.

## tRPC Routers

- `admin.restoreFoundation`
- `admin.dashboard`
- `admin.suspendFoundation`
- `donations.start`
- `donations.wallet`
- `foundations.current`
- `foundations.submitForReview`
- `goals.save`
- `goals.summary`
- `health.status`
- `onboarding.nextStep`
- `requests.archive`
- `requests.bannerPreview`
- `requests.create`
- `requests.foundationWorkspace`
- `requests.generateBanner`
- `requests.impactReport`
- `requests.publish`
- `requests.publicDetail`
- `requests.publicList`
- `trustee.approveReview`
- `trustee.rejectReview`
- `trustee.reviews`

The long-term API shape is tRPC-first. Product reads and mutations should move
through typed tRPC routers instead of Next server actions. Next.js route handlers
are reserved for framework-required HTTP/webhook surfaces such as payment
webhooks, auth plumbing, and binary/banner responses.

Provider checkout initialization is owned by `donations.start` so every checkout
is tied to a persisted pending donation before the user leaves Al-Infaaq.
