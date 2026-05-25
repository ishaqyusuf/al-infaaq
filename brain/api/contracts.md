# API Contracts

## Paystack Initialize

Input:

- `amountKobo`
- `email`
- `reference`
- `requestId`

Behavior:

- Creates a Paystack transaction.
- Marks metadata with `anonymousToFoundation: true`.
- Uses the configured app URL for donation completion.

## Lemon Squeezy Checkout

Input:

- `variantId`
- `donationReference`
- `email`
- `customPrice`

Behavior:

- Creates a checkout and stores the donation reference in custom checkout data.
