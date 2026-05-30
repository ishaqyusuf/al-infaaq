import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { UserRole } from "@al-infaaq/utils";
import type { TRPCError } from "@trpc/server";

const prismaMock = {
  $transaction: mock(async (operations: unknown[]) => {
    return await Promise.all(operations);
  }),
  auditLog: {
    create: mock(async (input: unknown) => input),
  },
  donation: {
    aggregate: mock(async () => ({ _sum: { amountKobo: 0 } })),
    create: mock(async (input: unknown) => input),
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

mock.module("@al-infaaq/db", () => ({
  prisma: prismaMock,
  readDatabaseRuntimeConfig: () => ({
    connectionString: "postgresql://test",
    provider: "postgres",
    status: "connected",
  }),
}));

mock.module("@al-infaaq/payments", () => ({
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
      showSpendingHistory: true,
    });

    expect(prismaMock.spenderProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          monthlyGoalKobo: 75_000,
          reminderChannel: "EMAIL",
          showSpendingHistory: true,
          userId: "spender-user",
        }),
        update: expect.objectContaining({
          monthlyGoalKobo: 75_000,
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
