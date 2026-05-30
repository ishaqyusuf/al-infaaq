import { beforeEach, describe, expect, mock, test } from "bun:test";

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
