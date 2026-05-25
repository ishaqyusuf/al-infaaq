"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@al-infaaq/db";
import {
  createLemonSqueezyCheckout,
  initializePaystackTransaction,
} from "@al-infaaq/payments";
import { nairaToKobo, resolveAppUrl } from "@al-infaaq/utils";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/server-auth";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function startDonation(formData: FormData) {
  const session = await requireRole(["spender", "admin"]);
  const requestId = asString(formData.get("requestId"));
  const provider = asString(formData.get("provider"));
  const amountNaira = Number(asString(formData.get("amountNaira")));

  if (!requestId || !Number.isFinite(amountNaira) || amountNaira <= 0) {
    throw new Error("A request and positive donation amount are required.");
  }

  const request = await prisma.donationRequest.findFirst({
    include: {
      foundation: true,
    },
    where: {
      foundation: {
        status: "APPROVED",
      },
      id: requestId,
      status: "PUBLISHED",
    },
  });

  if (!request) {
    throw new Error("Donation request is not available.");
  }

  const amountKobo = nairaToKobo(amountNaira);
  const reference = `don_${randomUUID().replaceAll("-", "")}`;
  const paymentProvider =
    provider === "lemon_squeezy" ? "LEMON_SQUEEZY" : "PAYSTACK";

  await prisma.donation.create({
    data: {
      amountKobo,
      donationRequestId: request.id,
      foundationId: request.foundationId,
      provider: paymentProvider,
      providerReference: reference,
      spenderId: session.user.id,
    },
  });

  if (paymentProvider === "LEMON_SQUEEZY") {
    const variantId = process.env.LEMONSQUEEZY_DONATION_VARIANT_ID;

    if (!variantId) {
      throw new Error("LEMONSQUEEZY_DONATION_VARIANT_ID is not configured.");
    }

    const checkout = await createLemonSqueezyCheckout({
      customPrice: amountKobo,
      donationReference: reference,
      email: session.user.email,
      variantId,
    });

    const checkoutUrl = checkout?.data?.attributes?.url;

    if (!checkoutUrl) {
      throw new Error("Lemon Squeezy checkout URL was not returned.");
    }

    redirect(checkoutUrl);
  }

  const appUrl = resolveAppUrl({
    fallbackOrigin: process.env.NEXT_PUBLIC_APP_URL,
  });

  const transaction = await initializePaystackTransaction({
    amountKobo,
    callbackUrl: `${appUrl}/donations/complete`,
    email: session.user.email ?? "anonymous@al-infaaq.local",
    metadata: {
      anonymousToFoundation: true,
      donationReference: reference,
      platform: "al-infaaq",
      requestId: request.id,
    },
    reference,
  });

  if (!transaction?.authorization_url) {
    throw new Error("Paystack authorization URL was not returned.");
  }

  redirect(transaction.authorization_url);
}
