import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { UserRole } from "@al-infaaq/utils";
import type { TRPCError } from "@trpc/server";

const prismaMock = {
  $transaction: mock(async (operations: unknown[]) => {
    return await Promise.all(operations);
  }),
  auditLog: {
    create: mock(async (input: unknown) => input),
    findMany: mock(async () => [] as unknown[]),
  },
  donation: {
    aggregate: mock(async () => ({ _sum: { amountKobo: 0 } })),
    create: mock(async (input: unknown) => input),
    findMany: mock(async () => [] as unknown[]),
    groupBy: mock(async () => [] as unknown[]),
  },
  donationRequest: {
    create: mock(async (input: unknown) => ({
      id: "request-created",
      ...(input as { data?: object }).data,
    })),
    findFirst: mock(async () => null as unknown),
    findMany: mock(async () => [] as unknown[]),
    findUnique: mock(async () => null as unknown),
    update: mock(async (input: unknown) => ({
      id: (input as { where?: { id?: string } }).where?.id ?? "request",
      ...(input as { data?: object }).data,
    })),
  },
  foundation: {
    findMany: mock(async () => [] as unknown[]),
    findFirst: mock(async () => null as unknown),
    findUnique: mock(async () => null as unknown),
    upsert: mock(async (input: unknown) => ({
      id: "foundation-upserted",
      ...(input as { create?: object }).create,
      ...(input as { update?: object }).update,
    })),
    update: mock(async (input: unknown) => ({
      id: (input as { where?: { id?: string } }).where?.id ?? "foundation",
      ...(input as { data?: object }).data,
    })),
  },
  fundraisingBanner: {
    create: mock(async (input: unknown) => ({
      id: "banner",
      ...(input as { data?: object }).data,
    })),
  },
  reminder: {
    create: mock(async (input: unknown) => ({
      id: "reminder",
      ...(input as { data?: object }).data,
    })),
    deleteMany: mock(async () => ({ count: 0 })),
    findFirst: mock(async () => null as unknown),
  },
  spenderProfile: {
    findUnique: mock(async () => null as unknown),
    upsert: mock(async (input: unknown) => ({
      id: "spender-profile-1",
      ...(input as { create?: object }).create,
      ...(input as { update?: object }).update,
    })),
  },
  spendingGoal: {
    create: mock(async (input: unknown) => ({
      id: "spending-goal",
      ...(input as { data?: object }).data,
    })),
  },
  trusteeReview: {
    create: mock(async (input: unknown) => ({
      id: "review-created",
      ...(input as { data?: object }).data,
    })),
    findFirst: mock(async () => null as unknown),
    findUnique: mock(async () => null as unknown),
    update: mock(async (input: unknown) => ({
      id: (input as { where?: { id?: string } }).where?.id ?? "review",
      ...(input as { data?: object }).data,
    })),
  },
  user: {
    findMany: mock(async () => [] as unknown[]),
    update: mock(async (input: unknown) => ({
      id: (input as { where?: { id?: string } }).where?.id ?? "user",
      ...(input as { data?: object }).data,
    })),
  },
};

const initializePaystackTransactionMock = mock(async () => ({
  authorization_url: "https://paystack.test/checkout",
}));
const createLemonSqueezyCheckoutMock = mock(async () => ({
  data: {
    attributes: {
      url: "https://lemonsqueezy.test/checkout",
    },
  },
}));
const paymentConfig = {
  lemonSqueezyConfigured: true,
  paystackConfigured: true,
};
const assertLemonSqueezyConfiguredMock = mock(() => {
  if (!paymentConfig.lemonSqueezyConfigured) {
    throw new Error("LEMONSQUEEZY_API_KEY is not configured.");
  }
});
const assertPaystackConfiguredMock = mock(() => {
  if (!paymentConfig.paystackConfigured) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }
});

mock.module("@al-infaaq/db", () => ({
  prisma: prismaMock,
  readDatabaseRuntimeConfig: () => ({
    connectionString: "postgresql://test",
    provider: "postgres",
    status: "connected",
  }),
}));

mock.module("@al-infaaq/payments", () => ({
  assertLemonSqueezyConfigured: assertLemonSqueezyConfiguredMock,
  assertPaystackConfigured: assertPaystackConfiguredMock,
  createLemonSqueezyCheckout: createLemonSqueezyCheckoutMock,
  initializePaystackTransaction: initializePaystackTransactionMock,
}));

const { appRouter } = await import("./_app");

function createCaller(role: UserRole) {
  return appRouter.createCaller({
    auth: {
      session: {
        user: {
          email: `${role}@al-infaaq.test`,
          id: `${role}-user`,
          role,
        },
      },
    },
    db: {
      connectionString: "postgresql://test",
      provider: "postgres",
      status: "connected",
    },
    headers: new Headers({
      origin: "https://alinfaaq.test",
    }),
  });
}

function resetMocks() {
  for (const delegate of Object.values(prismaMock)) {
    if (typeof delegate === "function") {
      delegate.mockClear();
      continue;
    }

    for (const fn of Object.values(delegate)) {
      if (typeof fn === "function") {
        fn.mockClear();
      }
    }
  }

  initializePaystackTransactionMock.mockClear();
  createLemonSqueezyCheckoutMock.mockClear();
  assertLemonSqueezyConfiguredMock.mockClear();
  assertPaystackConfiguredMock.mockClear();
  paymentConfig.lemonSqueezyConfigured = true;
  paymentConfig.paystackConfigured = true;
  process.env.LEMONSQUEEZY_DONATION_VARIANT_ID = "variant-1";
}

describe("router workflow behavior", () => {
  beforeEach(() => {
    resetMocks();
  });

  test("Trustee approval updates review, approves foundation, and records audit log", async () => {
    prismaMock.trusteeReview.findUnique.mockResolvedValueOnce({
      foundationId: "foundation-1",
      id: "review-1",
    });

    await createCaller("trustee").trustee.approveReview({
      notes: "Documents match.",
      reviewId: "review-1",
    });

    expect(prismaMock.trusteeReview.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notes: "Documents match.",
          status: "APPROVED",
          trusteeId: "trustee-user",
        }),
        where: {
          id: "review-1",
        },
      }),
    );
    expect(prismaMock.foundation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          status: "APPROVED",
        },
        where: {
          id: "foundation-1",
        },
      }),
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "foundation.trustee_review_approved",
        actorId: "trustee-user",
        target: "foundation-1",
      },
    });
  });

  test("Trustee rejection updates review, rejects foundation, and records audit log", async () => {
    prismaMock.trusteeReview.findUnique.mockResolvedValueOnce({
      foundationId: "foundation-1",
      id: "review-1",
    });

    await createCaller("trustee").trustee.rejectReview({
      notes: "Registration document could not be verified.",
      reviewId: "review-1",
    });

    expect(prismaMock.trusteeReview.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notes: "Registration document could not be verified.",
          status: "REJECTED",
          trusteeId: "trustee-user",
        }),
        where: {
          id: "review-1",
        },
      }),
    );
    expect(prismaMock.foundation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          status: "REJECTED",
        },
        where: {
          id: "foundation-1",
        },
      }),
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "foundation.trustee_review_rejected",
        actorId: "trustee-user",
        target: "foundation-1",
      },
    });
  });

  test("Trustee decisions reject missing review records before status changes", async () => {
    prismaMock.trusteeReview.findUnique.mockResolvedValueOnce(null);

    await expect(
      createCaller("trustee").trustee.rejectReview({
        notes: "Missing submission.",
        reviewId: "missing-review",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Review not found.",
    } satisfies Partial<TRPCError>);

    expect(prismaMock.trusteeReview.update).not.toHaveBeenCalled();
    expect(prismaMock.foundation.update).not.toHaveBeenCalled();
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  test("admin suspension updates foundation status and records audit log", async () => {
    await createCaller("admin").admin.suspendFoundation({
      foundationId: "foundation-1",
    });

    expect(prismaMock.foundation.update).toHaveBeenCalledWith({
      data: {
        status: "SUSPENDED",
      },
      where: {
        id: "foundation-1",
      },
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "foundation.suspended",
        actorId: "admin-user",
        target: "foundation-1",
      },
    });
  });

  test("admin restoration updates foundation status and records audit log", async () => {
    await createCaller("admin").admin.restoreFoundation({
      foundationId: "foundation-1",
    });

    expect(prismaMock.foundation.update).toHaveBeenCalledWith({
      data: {
        status: "APPROVED",
      },
      where: {
        id: "foundation-1",
      },
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "foundation.restored",
        actorId: "admin-user",
        target: "foundation-1",
      },
    });
  });

  test("admin dashboard assembles reconciliation, payout readiness, trust operations, and successful volume", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([{ id: "user-1" }] as never);
    prismaMock.foundation.findMany
      .mockResolvedValueOnce([{ id: "foundation-1" }] as never)
      .mockResolvedValueOnce([
        {
          id: "foundation-1",
          name: "Amanah Foundation",
          status: "APPROVED",
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          id: "foundation-suspended",
          name: "Suspended Foundation",
          status: "SUSPENDED",
          user: {
            email: "suspended@foundation.test",
          },
        },
      ] as never);
    prismaMock.donationRequest.findMany.mockResolvedValueOnce([
      { id: "request-1" },
    ] as never);
    prismaMock.donation.findMany
      .mockResolvedValueOnce([{ id: "donation-latest" }] as never)
      .mockResolvedValueOnce([
        {
          foundation: { name: "Amanah Foundation" },
          id: "donation-reconciliation",
          status: "FAILED",
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          foundation: { name: "Amanah Foundation" },
          id: "donation-stale",
          status: "PENDING",
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          foundation: { name: "Amanah Foundation" },
          id: "donation-high-value",
          status: "SUCCEEDED",
        },
      ] as never);
    prismaMock.auditLog.create.mockResolvedValueOnce({ id: "audit-create" });
    prismaMock.auditLog.findMany.mockResolvedValueOnce([
      { id: "audit-1" },
    ] as never);
    prismaMock.donation.groupBy
      .mockResolvedValueOnce([
        {
          _count: { _all: 2 },
          status: "PENDING",
        },
        {
          _count: { _all: 5 },
          status: "SUCCEEDED",
        },
        {
          _count: { _all: 1 },
          status: "REFUNDED",
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          _count: { _all: 3 },
          _sum: { amountKobo: 90_000 },
          provider: "PAYSTACK",
        },
        {
          _count: { _all: 2 },
          _sum: { amountKobo: 40_000 },
          provider: "LEMON_SQUEEZY",
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          _count: { _all: 5 },
          _sum: { amountKobo: 130_000 },
          foundationId: "foundation-1",
          status: "SUCCEEDED",
        },
      ] as never);
    prismaMock.donation.aggregate.mockResolvedValueOnce({
      _sum: { amountKobo: 130_000 },
    });

    const dashboard = await createCaller("admin").admin.dashboard();

    expect(dashboard.donationStatusCounts).toEqual({
      FAILED: 0,
      PENDING: 2,
      REFUNDED: 1,
      SUCCEEDED: 5,
    });
    expect(dashboard.providerTotals).toEqual({
      LEMON_SQUEEZY: {
        count: 2,
        succeededKobo: 40_000,
      },
      PAYSTACK: {
        count: 3,
        succeededKobo: 90_000,
      },
    });
    expect(dashboard.reconciliationItems).toHaveLength(1);
    expect(dashboard.reconciliationItems[0]?.id).toBe(
      "donation-reconciliation",
    );
    expect(dashboard.payoutReadiness).toEqual([
      {
        failedCount: 0,
        foundation: {
          id: "foundation-1",
          name: "Amanah Foundation",
          status: "APPROVED",
        },
        pendingCount: 0,
        ready: true,
        refundedKobo: 0,
        succeededCount: 5,
        succeededKobo: 130_000,
      },
    ]);
    expect(dashboard.stalePendingDonations[0]?.id).toBe("donation-stale");
    expect(dashboard.highValueDonations[0]?.id).toBe("donation-high-value");
    expect(dashboard.highValueReviewThresholdKobo).toBe(1_000_000);
    expect(dashboard.incidentReviewItems).toEqual([
      {
        id: "foundation:foundation-suspended",
        label: "Suspended Foundation",
        reason: "Foundation suspended",
        severity: "high",
        target: "foundation-suspended",
        type: "FOUNDATION",
      },
      {
        id: "donation:donation-reconciliation",
        label: "Amanah Foundation",
        reason: "Failed payment needs support review",
        severity: "medium",
        target: "donation-reconciliation",
        type: "PAYMENT",
      },
      {
        id: "pending:donation-stale",
        label: "Amanah Foundation",
        reason: "Stale pending payment",
        severity: "medium",
        target: "donation-stale",
        type: "PAYMENT",
      },
      {
        id: "high-value:donation-high-value",
        label: "Amanah Foundation",
        reason: "High-value successful gift",
        severity: "low",
        target: "donation-high-value",
        type: "PAYMENT",
      },
    ]);
    expect(dashboard.totalSucceededKobo).toBe(130_000);

    expect(prismaMock.donation.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          status: {
            in: ["PENDING", "FAILED", "REFUNDED"],
          },
        },
      }),
    );
    expect(prismaMock.donation.groupBy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        by: ["provider"],
        where: {
          status: "SUCCEEDED",
        },
      }),
    );
    expect(prismaMock.donation.groupBy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        by: ["foundationId", "status"],
        where: {
          status: {
            in: ["SUCCEEDED", "PENDING", "FAILED", "REFUNDED"],
          },
        },
      }),
    );
    expect(prismaMock.donation.findMany).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({
            lt: expect.any(Date),
          }),
          status: "PENDING",
        }),
      }),
    );
    expect(prismaMock.donation.findMany).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        where: {
          amountKobo: {
            gte: 1_000_000,
          },
          status: "SUCCEEDED",
        },
      }),
    );
    expect(prismaMock.donation.aggregate).toHaveBeenCalledWith({
      _sum: { amountKobo: true },
      where: {
        status: "SUCCEEDED",
      },
    });
  });

  test("request creation is blocked when caller has no approved foundation", async () => {
    prismaMock.foundation.findFirst.mockResolvedValueOnce(null);

    await expect(
      createCaller("foundation").requests.create({
        story: "Need details",
        targetNaira: 1000,
        title: "School kits",
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "An approved foundation is required to create requests.",
    } satisfies Partial<TRPCError>);

    expect(prismaMock.donationRequest.create).not.toHaveBeenCalled();
  });

  test("publishing is blocked for unapproved foundations", async () => {
    prismaMock.donationRequest.findUnique.mockResolvedValueOnce({
      foundation: {
        status: "SUSPENDED",
        userId: "foundation-user",
      },
      id: "request-1",
      status: "DRAFT",
    });

    await expect(
      createCaller("foundation").requests.publish({
        requestId: "request-1",
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Only approved foundations can publish requests.",
    } satisfies Partial<TRPCError>);

    expect(prismaMock.donationRequest.update).not.toHaveBeenCalled();
  });

  test("approved foundation owners can publish draft requests and audit the transition", async () => {
    prismaMock.donationRequest.findUnique.mockResolvedValueOnce({
      foundation: {
        status: "APPROVED",
        userId: "foundation-user",
      },
      id: "request-1",
      status: "DRAFT",
    });

    await createCaller("foundation").requests.publish({
      requestId: "request-1",
    });

    expect(prismaMock.donationRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          publishedAt: expect.any(Date),
          status: "PUBLISHED",
        }),
        where: {
          id: "request-1",
        },
      }),
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "donation_request.published",
        actorId: "foundation-user",
        target: "request-1",
      },
    });
  });

  test("publishing is blocked once a request leaves draft state", async () => {
    prismaMock.donationRequest.findUnique.mockResolvedValueOnce({
      foundation: {
        status: "APPROVED",
        userId: "foundation-user",
      },
      id: "request-1",
      status: "PUBLISHED",
    });

    await expect(
      createCaller("foundation").requests.publish({
        requestId: "request-1",
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Only draft requests can be published.",
    } satisfies Partial<TRPCError>);

    expect(prismaMock.donationRequest.update).not.toHaveBeenCalled();
  });

  test("request archive is owner-scoped, audited, and idempotent for already archived requests", async () => {
    prismaMock.donationRequest.findUnique.mockResolvedValueOnce({
      foundation: {
        status: "APPROVED",
        userId: "foundation-user",
      },
      id: "request-1",
      status: "PUBLISHED",
    });

    await createCaller("foundation").requests.archive({
      requestId: "request-1",
    });

    expect(prismaMock.donationRequest.update).toHaveBeenCalledWith({
      data: {
        status: "ARCHIVED",
      },
      where: {
        id: "request-1",
      },
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "donation_request.archived",
        actorId: "foundation-user",
        target: "request-1",
      },
    });

    resetMocks();
    prismaMock.donationRequest.findUnique.mockResolvedValueOnce({
      foundation: {
        status: "APPROVED",
        userId: "foundation-user",
      },
      id: "request-1",
      status: "ARCHIVED",
    });

    await createCaller("foundation").requests.archive({
      requestId: "request-1",
    });

    expect(prismaMock.donationRequest.update).not.toHaveBeenCalled();
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  test("foundation users cannot archive another foundation's requests", async () => {
    prismaMock.donationRequest.findUnique.mockResolvedValueOnce({
      foundation: {
        status: "APPROVED",
        userId: "another-foundation-user",
      },
      id: "request-1",
      status: "PUBLISHED",
    });

    await expect(
      createCaller("foundation").requests.archive({
        requestId: "request-1",
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "You can only archive your own foundation requests.",
    } satisfies Partial<TRPCError>);

    expect(prismaMock.donationRequest.update).not.toHaveBeenCalled();
  });

  test("donation start persists a pending donation before returning provider checkout", async () => {
    prismaMock.donationRequest.findFirst.mockResolvedValueOnce({
      foundationId: "foundation-1",
      id: "request-1",
    });

    await expect(
      createCaller("spender").donations.start({
        amountNaira: 2500,
        provider: "paystack",
        requestId: "request-1",
      }),
    ).resolves.toEqual({
      checkoutUrl: "https://paystack.test/checkout",
    });

    expect(prismaMock.donation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amountKobo: 250_000,
          donationRequestId: "request-1",
          foundationId: "foundation-1",
          provider: "PAYSTACK",
          spenderId: "spender-user",
        }),
      }),
    );
    expect(initializePaystackTransactionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amountKobo: 250_000,
        callbackUrl: "https://alinfaaq.test/donations/complete",
        email: "spender@al-infaaq.test",
        metadata: expect.objectContaining({
          anonymousToFoundation: true,
          platform: "al-infaaq",
          requestId: "request-1",
        }),
      }),
    );
  });

  test("donation start fails before pending donation creation when provider configuration is missing", async () => {
    paymentConfig.paystackConfigured = false;
    prismaMock.donationRequest.findFirst.mockResolvedValueOnce({
      foundationId: "foundation-1",
      id: "request-1",
    });

    await expect(
      createCaller("spender").donations.start({
        amountNaira: 2500,
        provider: "paystack",
        requestId: "request-1",
      }),
    ).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
      message: "PAYSTACK_SECRET_KEY is not configured.",
    } satisfies Partial<TRPCError>);

    expect(prismaMock.donation.create).not.toHaveBeenCalled();
    expect(initializePaystackTransactionMock).not.toHaveBeenCalled();
  });

  test("donation start filters to approved published requests before checkout side effects", async () => {
    prismaMock.donationRequest.findFirst.mockResolvedValueOnce(null);

    await expect(
      createCaller("spender").donations.start({
        amountNaira: 2500,
        provider: "paystack",
        requestId: "request-1",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Donation request is not available.",
    } satisfies Partial<TRPCError>);

    expect(prismaMock.donationRequest.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          foundation: true,
        },
        where: {
          foundation: {
            status: "APPROVED",
          },
          id: "request-1",
          status: "PUBLISHED",
        },
      }),
    );
    expect(prismaMock.donation.create).not.toHaveBeenCalled();
    expect(initializePaystackTransactionMock).not.toHaveBeenCalled();
    expect(createLemonSqueezyCheckoutMock).not.toHaveBeenCalled();
  });

  test("public request detail keeps funded requests visible for approved foundations only", async () => {
    prismaMock.donationRequest.findFirst.mockResolvedValueOnce({
      foundation: {
        status: "APPROVED",
      },
      id: "request-1",
      status: "FUNDED",
    });

    await expect(
      createCaller("spender").requests.publicDetail({
        requestId: "request-1",
      }),
    ).resolves.toMatchObject({
      id: "request-1",
      status: "FUNDED",
    });

    expect(prismaMock.donationRequest.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          foundation: true,
        },
        where: {
          foundation: {
            status: "APPROVED",
          },
          id: "request-1",
          status: {
            in: ["PUBLISHED", "FUNDED"],
          },
        },
      }),
    );
  });

  test("public request detail hides requests outside approved public visibility", async () => {
    prismaMock.donationRequest.findFirst.mockResolvedValueOnce(null);

    await expect(
      createCaller("spender").requests.publicDetail({
        requestId: "request-1",
      }),
    ).resolves.toBeNull();

    expect(prismaMock.donationRequest.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          foundation: {
            status: "APPROVED",
          },
          status: {
            in: ["PUBLISHED", "FUNDED"],
          },
        }),
      }),
    );
  });

  test("onboarding sends spenders without a positive monthly goal to private goals", async () => {
    prismaMock.spenderProfile.findUnique.mockResolvedValueOnce(null);

    await expect(
      createCaller("spender").onboarding.nextStep(),
    ).resolves.toEqual({
      complete: false,
      href: "/goals",
      label: "Set monthly giving goal",
      summary: "Create a private sadaqah target and track progress quietly.",
    });

    expect(prismaMock.foundation.findUnique).not.toHaveBeenCalled();
  });

  test("onboarding sends spenders with a positive monthly goal to public requests", async () => {
    prismaMock.spenderProfile.findUnique.mockResolvedValueOnce({
      monthlyGoalKobo: 50_000,
    } as never);

    await expect(
      createCaller("spender").onboarding.nextStep(),
    ).resolves.toEqual({
      complete: true,
      href: "/requests",
      label: "Browse donation requests",
      summary: "Find approved requests and give anonymously.",
    });

    expect(prismaMock.foundation.findUnique).not.toHaveBeenCalled();
  });

  test("onboarding sends incomplete foundation profiles to foundation application", async () => {
    const incompleteFoundations = [
      null,
      { status: "PENDING_REVIEW" },
      { status: "REJECTED" },
      { status: "SUSPENDED" },
    ];

    for (const foundation of incompleteFoundations) {
      resetMocks();
      prismaMock.foundation.findUnique.mockResolvedValueOnce(
        foundation as never,
      );

      await expect(
        createCaller("foundation").onboarding.nextStep(),
      ).resolves.toEqual({
        complete: false,
        href: "/foundations/apply",
        label: "Complete foundation onboarding",
        summary: "Submit or update your profile for Trustee review.",
      });

      expect(prismaMock.spenderProfile.findUnique).not.toHaveBeenCalled();
    }
  });

  test("onboarding sends approved foundations to request management", async () => {
    prismaMock.foundation.findUnique.mockResolvedValueOnce({
      status: "APPROVED",
    } as never);

    await expect(
      createCaller("foundation").onboarding.nextStep(),
    ).resolves.toEqual({
      complete: true,
      href: "/foundation/requests",
      label: "Manage foundation requests",
      summary: "Create, publish, and review aggregate request performance.",
    });

    expect(prismaMock.spenderProfile.findUnique).not.toHaveBeenCalled();
  });

  test("onboarding sends Trustees and admins directly to their workspaces", async () => {
    await expect(
      createCaller("trustee").onboarding.nextStep(),
    ).resolves.toEqual({
      complete: true,
      href: "/trustee/reviews",
      label: "Open Trustee review queue",
      summary: "Approve or reject foundation review requests.",
    });

    await expect(createCaller("admin").onboarding.nextStep()).resolves.toEqual({
      complete: true,
      href: "/admin",
      label: "Review platform operations",
      summary:
        "Manage users, foundations, requests, donations, and audit logs.",
    });

    expect(prismaMock.foundation.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.spenderProfile.findUnique).not.toHaveBeenCalled();
  });

  test("foundation onboarding promotes account, creates Trustee review, and audits submission", async () => {
    prismaMock.foundation.upsert.mockResolvedValueOnce({
      id: "foundation-1",
      name: "Al Barakah Foundation",
      status: "PENDING_REVIEW",
    } as never);
    prismaMock.trusteeReview.findFirst.mockResolvedValueOnce(null);

    await createCaller("spender").foundations.submitForReview({
      contactEmail: "",
      description: "Community food support.",
      documentUrl: "",
      name: "Al Barakah Foundation",
      registrationNumber: "CAC-123",
      websiteUrl: "",
    });

    expect(prismaMock.foundation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          contactEmail: "spender@al-infaaq.test",
          description: "Community food support.",
          name: "Al Barakah Foundation",
          registrationNumber: "CAC-123",
          slug: "al-barakah-foundation",
          status: "PENDING_REVIEW",
          userId: "spender-user",
        }),
        update: expect.objectContaining({
          status: "PENDING_REVIEW",
        }),
        where: {
          userId: "spender-user",
        },
      }),
    );
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      data: {
        role: "FOUNDATION",
      },
      where: {
        id: "spender-user",
      },
    });
    expect(prismaMock.trusteeReview.create).toHaveBeenCalledWith({
      data: {
        foundationId: "foundation-1",
      },
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "foundation.submitted_for_trustee_review",
        actorId: "spender-user",
        target: "foundation-1",
      },
    });
  });

  test("spender goal save replaces future reminders and queues next reminder for positive goals", async () => {
    prismaMock.spenderProfile.upsert.mockResolvedValueOnce({
      id: "spender-profile-1",
      monthlyGoalKobo: 75_000,
    } as never);

    await createCaller("spender").goals.save({
      monthlyGoalNaira: 750,
      reminderChannel: "EMAIL",
      remindersEnabled: true,
      showSpendingHistory: true,
    });

    expect(prismaMock.spenderProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          monthlyGoalKobo: 75_000,
          reminderChannel: "EMAIL",
          remindersEnabled: true,
          showSpendingHistory: true,
          userId: "spender-user",
        }),
        update: expect.objectContaining({
          monthlyGoalKobo: 75_000,
          remindersEnabled: true,
        }),
      }),
    );
    expect(prismaMock.reminder.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sentAt: null,
          userId: "spender-user",
        }),
      }),
    );
    expect(prismaMock.spendingGoal.create).toHaveBeenCalledWith({
      data: {
        monthlyAmountKobo: 75_000,
        spenderProfileId: "spender-profile-1",
      },
    });
    expect(prismaMock.reminder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          channel: "EMAIL",
          userId: "spender-user",
        }),
      }),
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "spender.goal_saved",
        actorId: "spender-user",
        target: "spender-profile-1",
      },
    });
  });

  test("spender goal save clears future reminders without queueing work for zero goals", async () => {
    prismaMock.spenderProfile.upsert.mockResolvedValueOnce({
      id: "spender-profile-1",
      monthlyGoalKobo: 0,
    } as never);

    await createCaller("spender").goals.save({
      monthlyGoalNaira: 0,
      reminderChannel: "EMAIL",
      remindersEnabled: true,
      showSpendingHistory: false,
    });

    expect(prismaMock.spenderProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          monthlyGoalKobo: 0,
          remindersEnabled: true,
          showSpendingHistory: false,
          userId: "spender-user",
        }),
        update: expect.objectContaining({
          monthlyGoalKobo: 0,
          remindersEnabled: true,
          showSpendingHistory: false,
        }),
      }),
    );
    expect(prismaMock.reminder.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sentAt: null,
          userId: "spender-user",
        }),
      }),
    );
    expect(prismaMock.spendingGoal.create).not.toHaveBeenCalled();
    expect(prismaMock.reminder.create).not.toHaveBeenCalled();
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "spender.goal_saved",
        actorId: "spender-user",
        target: "spender-profile-1",
      },
    });
  });

  test("spender goal save keeps goal progress but disables future reminders", async () => {
    prismaMock.spenderProfile.upsert.mockResolvedValueOnce({
      id: "spender-profile-1",
      monthlyGoalKobo: 75_000,
    } as never);

    await createCaller("spender").goals.save({
      monthlyGoalNaira: 750,
      reminderChannel: "EMAIL",
      remindersEnabled: false,
      showSpendingHistory: true,
    });

    expect(prismaMock.spenderProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          monthlyGoalKobo: 75_000,
          reminderChannel: "EMAIL",
          remindersEnabled: false,
          showSpendingHistory: true,
          userId: "spender-user",
        }),
        update: expect.objectContaining({
          monthlyGoalKobo: 75_000,
          remindersEnabled: false,
        }),
      }),
    );
    expect(prismaMock.reminder.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sentAt: null,
          userId: "spender-user",
        }),
      }),
    );
    expect(prismaMock.spendingGoal.create).toHaveBeenCalledWith({
      data: {
        monthlyAmountKobo: 75_000,
        spenderProfileId: "spender-profile-1",
      },
    });
    expect(prismaMock.reminder.create).not.toHaveBeenCalled();
  });

  test("banner generation stores QR-backed banner for published approved foundation request", async () => {
    prismaMock.donationRequest.findUnique.mockResolvedValueOnce({
      foundation: {
        name: "Al Barakah Foundation",
        status: "APPROVED",
        userId: "foundation-user",
      },
      id: "request-1",
      status: "PUBLISHED",
      title: "Food packs",
    });

    const result = await createCaller("foundation").requests.generateBanner({
      requestId: "request-1",
    });

    expect(result.requestUrl).toBe("https://alinfaaq.test/requests/request-1");
    expect(prismaMock.fundraisingBanner.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          donationRequestId: "request-1",
          imageUrl: expect.stringContaining("data:image/svg+xml;base64,"),
          qrCodeUrl: expect.stringContaining("data:image/png;base64,"),
        }),
      }),
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "donation_request.banner_generated",
        actorId: "foundation-user",
        target: "request-1",
      },
    });
  });

  test("request impact report is owner-scoped and aggregate-only", async () => {
    prismaMock.donationRequest.findUnique.mockResolvedValueOnce({
      _count: {
        banners: 2,
      },
      foundation: {
        id: "foundation-1",
        name: "Amanah Foundation",
        userId: "foundation-user",
      },
      foundationId: "foundation-1",
      id: "request-1",
      raisedKobo: 75_000,
      status: "PUBLISHED",
      targetKobo: 100_000,
      title: "Food parcels",
    });
    prismaMock.donation.groupBy.mockResolvedValueOnce([
      {
        _count: { _all: 3 },
        _sum: { amountKobo: 75_000 },
        status: "SUCCEEDED",
      },
      {
        _count: { _all: 1 },
        _sum: { amountKobo: 10_000 },
        status: "PENDING",
      },
    ] as never);

    const report = await createCaller("foundation").requests.impactReport({
      requestId: "request-1",
    });

    expect(report).toMatchObject({
      bannerCount: 2,
      progressPercent: 75,
      remainingKobo: 25_000,
      statusCounts: {
        FAILED: 0,
        PENDING: 1,
        REFUNDED: 0,
        SUCCEEDED: 3,
      },
      statusTotalsKobo: {
        FAILED: 0,
        PENDING: 10_000,
        REFUNDED: 0,
        SUCCEEDED: 75_000,
      },
      successfulDonationCount: 3,
      successfulKobo: 75_000,
    });
    expect(prismaMock.donation.groupBy).toHaveBeenCalledWith({
      _count: { _all: true },
      _sum: { amountKobo: true },
      by: ["status"],
      where: {
        donationRequestId: "request-1",
        foundationId: "foundation-1",
      },
    });
  });

  test("request impact report hides other foundations' requests", async () => {
    prismaMock.donationRequest.findUnique.mockResolvedValueOnce({
      foundation: {
        userId: "other-foundation-user",
      },
      id: "request-1",
    });

    await expect(
      createCaller("foundation").requests.impactReport({
        requestId: "request-1",
      }),
    ).resolves.toBeNull();

    expect(prismaMock.donation.groupBy).not.toHaveBeenCalled();
  });

  test("public request list only reads approved foundations and public request statuses", async () => {
    prismaMock.donationRequest.findMany.mockResolvedValueOnce([]);

    await createCaller("spender").requests.publicList();

    expect(prismaMock.donationRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          foundation: true,
        },
        where: {
          foundation: {
            status: "APPROVED",
          },
          status: {
            in: ["PUBLISHED", "FUNDED"],
          },
        },
      }),
    );
  });
});
