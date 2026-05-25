import { createHmac, timingSafeEqual } from "node:crypto";

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyHmacSignature({
  algorithm,
  payload,
  secret,
  signature,
}: {
  algorithm: "sha256" | "sha512";
  payload: string;
  secret: string;
  signature: string | null;
}) {
  if (!signature) {
    return false;
  }

  const expected = createHmac(algorithm, secret).update(payload).digest("hex");
  return safeCompare(expected, signature);
}

export function verifyPaystackWebhookSignature({
  payload,
  signature,
}: {
  payload: string;
  signature: string | null;
}) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }

  return verifyHmacSignature({
    algorithm: "sha512",
    payload,
    secret,
    signature,
  });
}

export function verifyLemonSqueezyWebhookSignature({
  payload,
  signature,
}: {
  payload: string;
  signature: string | null;
}) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET is not configured.");
  }

  return verifyHmacSignature({
    algorithm: "sha256",
    payload,
    secret,
    signature,
  });
}
