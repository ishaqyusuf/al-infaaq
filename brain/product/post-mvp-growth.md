# Post-MVP Growth

These tracks are intentionally after the first stable release. They should not
weaken the MVP privacy and payment guarantees.

## WhatsApp Reminders

- Add a WhatsApp provider adapter beside email/SMS reminder channels.
- Require explicit opt-in and an unsubscribe path.
- Reuse `Reminder` rows as the durable queue source.

## Installable PWA

- Keep the app shell usable on mobile viewports.
- Extend the current manifest with production icons and offline fallbacks.
- Prioritize donor request browsing, wallet, and foundation request management.

## Impact Reports

- Let foundations attach post-funding updates to requests.
- Keep impact reports public-safe and free of spender identities.
- Add admin moderation before sensitive media is published.

## Payout Automation

- Start with payout readiness reports before moving money automatically.
- Reconcile provider totals, request totals, refunds, and foundation status.
- Block payouts for suspended foundations.

## Donor Receipts

- Generate private receipt exports from successful donation rows.
- Do not expose receipts to foundations.
- Include provider reference, amount, request, foundation, and timestamp.

## Multi-Currency Routing

- Keep Paystack as the primary NGN route.
- Route global donations through Lemon Squeezy or later regional providers.
- Store provider, amount, and currency explicitly before expanding beyond NGN.
