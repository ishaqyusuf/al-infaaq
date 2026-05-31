import { verifyLemonSqueezyWebhookSignature } from "@al-infaaq/payments/webhooks";
import { NextResponse } from "next/server";
import {
  markDonationFailed,
  markDonationRefunded,
  markDonationSucceeded,
} from "../../_shared";

type LemonSqueezyWebhookPayload = {
  meta?: {
    custom_data?: {
      donation_reference?: string;
    };
    event_name?: string;
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  let isVerified = false;

  try {
    isVerified = verifyLemonSqueezyWebhookSignature({
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

  let payload: LemonSqueezyWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const reference = payload.meta?.custom_data?.donation_reference;

  if (!reference) {
    return NextResponse.json({ received: true });
  }

  if (payload.meta?.event_name === "order_created") {
    await markDonationSucceeded(reference);
  } else if (payload.meta?.event_name === "order_refunded") {
    await markDonationRefunded(reference);
  } else if (payload.meta?.event_name === "subscription_payment_failed") {
    await markDonationFailed(reference);
  }

  return NextResponse.json({ received: true });
}
