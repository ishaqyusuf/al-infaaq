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

  if (!verifyPaystackWebhookSignature({ payload: rawBody, signature })) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as PaystackWebhookPayload;
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
