type PaystackInitializeInput = {
  amountKobo: number;
  email: string;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
};

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }

  return key;
}

export async function initializePaystackTransaction(
  input: PaystackInitializeInput,
) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountKobo,
      callback_url: input.callbackUrl,
      email: input.email,
      metadata: input.metadata,
      reference: input.reference,
    }),
  });

  const payload = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !payload.status) {
    throw new Error(
      payload.message || "Unable to initialize Paystack donation.",
    );
  }

  return payload.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${getPaystackSecretKey()}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Unable to verify Paystack transaction.");
  }

  return response.json();
}
