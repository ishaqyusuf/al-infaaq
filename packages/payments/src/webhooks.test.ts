import { afterEach, describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";
import {
  verifyLemonSqueezyWebhookSignature,
  verifyPaystackWebhookSignature,
} from "./webhooks";

const originalPaystackSecret = process.env.PAYSTACK_SECRET_KEY;
const originalLemonSqueezySecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

afterEach(() => {
  process.env.PAYSTACK_SECRET_KEY = originalPaystackSecret;
  process.env.LEMONSQUEEZY_WEBHOOK_SECRET = originalLemonSqueezySecret;
});

function hmac(algorithm: "sha256" | "sha512", secret: string, payload: string) {
  return createHmac(algorithm, secret).update(payload).digest("hex");
}

describe("payment webhook signatures", () => {
  test("verifies valid Paystack SHA-512 signatures", () => {
    const payload = JSON.stringify({ data: { reference: "don_123" } });
    process.env.PAYSTACK_SECRET_KEY = "paystack_secret";

    expect(
      verifyPaystackWebhookSignature({
        payload,
        signature: hmac("sha512", "paystack_secret", payload),
      }),
    ).toBe(true);
  });

  test("rejects invalid Paystack signatures", () => {
    process.env.PAYSTACK_SECRET_KEY = "paystack_secret";

    expect(
      verifyPaystackWebhookSignature({
        payload: "{}",
        signature: "invalid",
      }),
    ).toBe(false);
  });

  test("verifies valid Lemon Squeezy SHA-256 signatures", () => {
    const payload = JSON.stringify({
      meta: { custom_data: { donation_reference: "don_123" } },
    });
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "lemon_secret";

    expect(
      verifyLemonSqueezyWebhookSignature({
        payload,
        signature: hmac("sha256", "lemon_secret", payload),
      }),
    ).toBe(true);
  });

  test("rejects missing signatures", () => {
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "lemon_secret";

    expect(
      verifyLemonSqueezyWebhookSignature({
        payload: "{}",
        signature: null,
      }),
    ).toBe(false);
  });
});
