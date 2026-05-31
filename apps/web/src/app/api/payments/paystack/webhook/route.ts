import { verifyPaystackWebhookSignature } from "@al-infaaq/payments/webhooks";
import { NextResponse } from "next/server";
import {
  markDonationFailed,
  markDonationRefunded,
  markDonationSucceeded,
} from "../../_shared";

type PaystackWebhookPayload = {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  let isVerified = false;

  try {
    isVerified = verifyPaystackWebhookSignature({
      payload: rawBody,
      signature,
    });
  } catch {
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 503 },
    );
  }

  if (!isVerified) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: PaystackWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as PaystackWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const reference = payload.data?.reference;

  if (!reference) {
    return NextResponse.json({ received: true });
  }

  if (
    payload.event === "charge.success" ||
    payload.data?.status === "success"
  ) {
    await markDonationSucceeded(reference);
  } else if (payload.event === "refund.processed") {
    await markDonationRefunded(reference);
  } else if (payload.data?.status === "failed") {
    await markDonationFailed(reference);
  }

  return NextResponse.json({ received: true });
}
