import { beforeEach, describe, expect, mock, test } from "bun:test";
import { createHmac } from "node:crypto";

type DonationStatus = "FAILED" | "PENDING" | "REFUNDED" | "SUCCEEDED";
type RequestStatus = "ARCHIVED" | "DRAFT" | "FUNDED" | "PUBLISHED";

type MockDonation = {
  amountKobo: number;
  donationRequestId: string | null;
  id: string;
  status: DonationStatus;
};

type MockRequest = {
  id: string;
  raisedKobo: number;
  status: RequestStatus;
  targetKobo: number;
};

const txMock = {
  donation: {
    findUnique: mock(async () => null as MockDonation | null),
    update: mock(async (input: { data: { status: DonationStatus } }) => ({
      id: "donation-1",
      status: input.data.status,
    })),
  },
  donationRequest: {
    update: mock(
      async (input: {
        data: {
          raisedKobo?: { decrement?: number; increment?: number };
          status?: RequestStatus;
        };
        where: { id: string };
      }) => {
        if (input.data.status) {
          return {
            id: input.where.id,
            raisedKobo: 0,
            status: input.data.status,
            targetKobo: 100_000,
          };
        }

        const increment = input.data.raisedKobo?.increment ?? 0;
        const decrement = input.data.raisedKobo?.decrement ?? 0;

        return {
          id: input.where.id,
          raisedKobo: 100_000 + increment - decrement,
          status: increment > 0 ? "PUBLISHED" : "FUNDED",
          targetKobo: 100_000,
        };
      },
    ),
  },
};

const prismaMock = {
  $transaction: mock(async (callback: (tx: typeof txMock) => unknown) => {
    return await callback(txMock);
  }),
  donation: {
    findUnique: mock(async () => null as MockDonation | null),
    update: mock(async (input: { data: { status: DonationStatus } }) => ({
      id: "donation-1",
      status: input.data.status,
    })),
  },
};

mock.module("@al-infaaq/db", () => ({
  prisma: prismaMock,
}));

const { markDonationFailed, markDonationRefunded, markDonationSucceeded } =
  await import("./_shared");
const { POST: paystackWebhookPost } = await import("./paystack/webhook/route");
const { POST: lemonSqueezyWebhookPost } = await import(
  "./lemonsqueezy/webhook/route"
);

function resetMocks() {
  prismaMock.$transaction.mockClear();
  prismaMock.donation.findUnique.mockClear();
  prismaMock.donation.update.mockClear();
  txMock.donation.findUnique.mockClear();
  txMock.donation.update.mockClear();
  txMock.donationRequest.update.mockClear();
}

describe("payment webhook donation state workflows", () => {
  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = "paystack-test-secret";
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "lemonsqueezy-test-secret";
    resetMocks();
  });

  test("success is idempotent for already-succeeded donations", async () => {
    txMock.donation.findUnique.mockResolvedValueOnce({
      amountKobo: 50_000,
      donationRequestId: "request-1",
      id: "donation-1",
      status: "SUCCEEDED",
    });

    await markDonationSucceeded("don_ref");

    expect(txMock.donation.update).not.toHaveBeenCalled();
    expect(txMock.donationRequest.update).not.toHaveBeenCalled();
  });

  test("success marks donation succeeded, increments raised total, and funds complete requests", async () => {
    txMock.donation.findUnique.mockResolvedValueOnce({
      amountKobo: 50_000,
      donationRequestId: "request-1",
      id: "donation-1",
      status: "PENDING",
    });
    txMock.donationRequest.update.mockResolvedValueOnce({
      id: "request-1",
      raisedKobo: 120_000,
      status: "PUBLISHED",
      targetKobo: 100_000,
    } satisfies MockRequest);

    await markDonationSucceeded("don_ref");

    expect(txMock.donation.update).toHaveBeenCalledWith({
      data: {
        status: "SUCCEEDED",
      },
      where: {
        id: "donation-1",
      },
    });
    expect(txMock.donationRequest.update).toHaveBeenNthCalledWith(1, {
      data: {
        raisedKobo: {
          increment: 50_000,
        },
      },
      where: {
        id: "request-1",
      },
    });
    expect(txMock.donationRequest.update).toHaveBeenNthCalledWith(2, {
      data: {
        status: "FUNDED",
      },
      where: {
        id: "request-1",
      },
    });
  });

  test("refund is idempotent for already-refunded donations", async () => {
    txMock.donation.findUnique.mockResolvedValueOnce({
      amountKobo: 50_000,
      donationRequestId: "request-1",
      id: "donation-1",
      status: "REFUNDED",
    });

    await markDonationRefunded("don_ref");

    expect(txMock.donation.update).not.toHaveBeenCalled();
    expect(txMock.donationRequest.update).not.toHaveBeenCalled();
  });

  test("refund decrements successful donation totals and reopens underfunded requests", async () => {
    txMock.donation.findUnique.mockResolvedValueOnce({
      amountKobo: 50_000,
      donationRequestId: "request-1",
      id: "donation-1",
      status: "SUCCEEDED",
    });
    txMock.donationRequest.update.mockResolvedValueOnce({
      id: "request-1",
      raisedKobo: 80_000,
      status: "FUNDED",
      targetKobo: 100_000,
    } satisfies MockRequest);

    await markDonationRefunded("don_ref");

    expect(txMock.donation.update).toHaveBeenCalledWith({
      data: {
        status: "REFUNDED",
      },
      where: {
        id: "donation-1",
      },
    });
    expect(txMock.donationRequest.update).toHaveBeenNthCalledWith(1, {
      data: {
        raisedKobo: {
          decrement: 50_000,
        },
      },
      where: {
        id: "request-1",
      },
    });
    expect(txMock.donationRequest.update).toHaveBeenNthCalledWith(2, {
      data: {
        status: "PUBLISHED",
      },
      where: {
        id: "request-1",
      },
    });
  });

  test("failure only updates pending donations", async () => {
    prismaMock.donation.findUnique.mockResolvedValueOnce({
      amountKobo: 50_000,
      donationRequestId: "request-1",
      id: "donation-1",
      status: "SUCCEEDED",
    });

    await markDonationFailed("don_ref");

    expect(prismaMock.donation.update).not.toHaveBeenCalled();

    prismaMock.donation.findUnique.mockResolvedValueOnce({
      amountKobo: 50_000,
      donationRequestId: "request-1",
      id: "donation-2",
      status: "PENDING",
    });

    await markDonationFailed("don_ref");

    expect(prismaMock.donation.update).toHaveBeenCalledWith({
      data: {
        status: "FAILED",
      },
      where: {
        id: "donation-2",
      },
    });
  });
});

function signPayload({
  algorithm,
  payload,
  secret,
}: {
  algorithm: "sha256" | "sha512";
  payload: string;
  secret: string;
}) {
  return createHmac(algorithm, secret).update(payload).digest("hex");
}

describe("payment webhook route handlers", () => {
  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = "paystack-test-secret";
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "lemonsqueezy-test-secret";
    resetMocks();
  });

  test("Paystack rejects invalid signatures without touching donation state", async () => {
    const response = await paystackWebhookPost(
      new Request("http://localhost/api/payments/paystack/webhook", {
        body: JSON.stringify({
          data: {
            reference: "don_ref",
            status: "success",
          },
          event: "charge.success",
        }),
        headers: {
          "x-paystack-signature": "bad-signature",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.donation.update).not.toHaveBeenCalled();
  });

  test("Paystack reports missing webhook secret as a controlled configuration error", async () => {
    delete process.env.PAYSTACK_SECRET_KEY;

    const response = await paystackWebhookPost(
      new Request("http://localhost/api/payments/paystack/webhook", {
        body: "{}",
        headers: {
          "x-paystack-signature": "irrelevant",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Webhook secret is not configured.",
    });
  });

  test("Paystack rejects malformed signed JSON before donation state changes", async () => {
    const payload = "{";
    const signature = signPayload({
      algorithm: "sha512",
      payload,
      secret: "paystack-test-secret",
    });

    const response = await paystackWebhookPost(
      new Request("http://localhost/api/payments/paystack/webhook", {
        body: payload,
        headers: {
          "x-paystack-signature": signature,
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid JSON." });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  test("Paystack successful charge marks the referenced donation succeeded", async () => {
    txMock.donation.findUnique.mockResolvedValueOnce({
      amountKobo: 25_000,
      donationRequestId: "request-1",
      id: "donation-1",
      status: "PENDING",
    });

    const payload = JSON.stringify({
      data: {
        reference: "don_ref",
        status: "success",
      },
      event: "charge.success",
    });
    const signature = signPayload({
      algorithm: "sha512",
      payload,
      secret: "paystack-test-secret",
    });

    const response = await paystackWebhookPost(
      new Request("http://localhost/api/payments/paystack/webhook", {
        body: payload,
        headers: {
          "x-paystack-signature": signature,
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(txMock.donation.update).toHaveBeenCalledWith({
      data: {
        status: "SUCCEEDED",
      },
      where: {
        id: "donation-1",
      },
    });
  });

  test("Lemon Squeezy rejects invalid signatures without touching donation state", async () => {
    const response = await lemonSqueezyWebhookPost(
      new Request("http://localhost/api/payments/lemonsqueezy/webhook", {
        body: JSON.stringify({
          meta: {
            custom_data: {
              donation_reference: "don_ref",
            },
            event_name: "order_created",
          },
        }),
        headers: {
          "x-signature": "bad-signature",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.donation.update).not.toHaveBeenCalled();
  });

  test("Lemon Squeezy reports missing webhook secret as a controlled configuration error", async () => {
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    const response = await lemonSqueezyWebhookPost(
      new Request("http://localhost/api/payments/lemonsqueezy/webhook", {
        body: "{}",
        headers: {
          "x-signature": "irrelevant",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Webhook secret is not configured.",
    });
  });

  test("Lemon Squeezy rejects malformed signed JSON before donation state changes", async () => {
    const payload = "{";
    const signature = signPayload({
      algorithm: "sha256",
      payload,
      secret: "lemonsqueezy-test-secret",
    });

    const response = await lemonSqueezyWebhookPost(
      new Request("http://localhost/api/payments/lemonsqueezy/webhook", {
        body: payload,
        headers: {
          "x-signature": signature,
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid JSON." });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  test("Lemon Squeezy order creation marks the referenced donation succeeded", async () => {
    txMock.donation.findUnique.mockResolvedValueOnce({
      amountKobo: 25_000,
      donationRequestId: "request-1",
      id: "donation-1",
      status: "PENDING",
    });

    const payload = JSON.stringify({
      meta: {
        custom_data: {
          donation_reference: "don_ref",
        },
        event_name: "order_created",
      },
    });
    const signature = signPayload({
      algorithm: "sha256",
      payload,
      secret: "lemonsqueezy-test-secret",
    });

    const response = await lemonSqueezyWebhookPost(
      new Request("http://localhost/api/payments/lemonsqueezy/webhook", {
        body: payload,
        headers: {
          "x-signature": signature,
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(txMock.donation.update).toHaveBeenCalledWith({
      data: {
        status: "SUCCEEDED",
      },
      where: {
        id: "donation-1",
      },
    });
  });
});
