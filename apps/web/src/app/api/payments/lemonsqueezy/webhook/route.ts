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

  if (!verifyLemonSqueezyWebhookSignature({ payload: rawBody, signature })) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
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
