import { createLemonSqueezyCheckout } from "@al-infaaq/payments/lemonsqueezy";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      customPrice?: number;
      donationReference?: string;
      email?: string;
      variantId?: string;
    };

    if (!body.variantId || !body.donationReference) {
      return NextResponse.json(
        { error: "variantId and donationReference are required." },
        { status: 400 },
      );
    }

    const data = await createLemonSqueezyCheckout({
      customPrice: body.customPrice,
      donationReference: body.donationReference,
      email: body.email,
      variantId: body.variantId,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Checkout creation failed.",
      },
      { status: 500 },
    );
  }
}
