import { initializePaystackTransaction } from "@al-infaaq/payments/paystack";
import { resolveAppUrl } from "@al-infaaq/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      amountKobo?: number;
      email?: string;
      reference?: string;
      requestId?: string;
    };

    if (!body.amountKobo || !body.email || !body.reference) {
      return NextResponse.json(
        { error: "amountKobo, email, and reference are required." },
        { status: 400 },
      );
    }

    const appUrl = resolveAppUrl({
      fallbackOrigin: new URL(request.url).origin,
    });

    const data = await initializePaystackTransaction({
      amountKobo: body.amountKobo,
      callbackUrl: `${appUrl}/donations/complete`,
      email: body.email,
      metadata: {
        anonymousToFoundation: true,
        platform: "al-infaaq",
        requestId: body.requestId,
      },
      reference: body.reference,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payment initialization failed.",
      },
      { status: 500 },
    );
  }
}
