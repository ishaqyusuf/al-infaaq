import { prisma } from "@al-infaaq/db";
import { z } from "zod";

import { createTRPCRouter, permissionProcedure } from "../lib.trpc";

const foundationIdInputSchema = z.object({
  foundationId: z.string().min(1),
});
const stalePendingCutoffMs = 30 * 60 * 1000;
const highValueReviewThresholdKobo = 1_000_000;

async function setFoundationStatus({
  actorId,
  action,
  foundationId,
  status,
}: {
  actorId: string;
  action: string;
  foundationId: string;
  status: "APPROVED" | "SUSPENDED";
}) {
  await prisma.$transaction([
    prisma.foundation.update({
      data: {
        status,
      },
      where: {
        id: foundationId,
      },
    }),
    prisma.auditLog.create({
      data: {
        action,
        actorId,
        target: foundationId,
      },
    }),
  ]);

  return { ok: true };
}

export const adminRouter = createTRPCRouter({
  dashboard: permissionProcedure("admin:manage").query(async () => {
    const stalePendingCutoff = new Date(Date.now() - stalePendingCutoffMs);
    const [
      users,
      foundations,
      requests,
      donations,
      auditLogs,
      donationStatusGroups,
      providerSucceededGroups,
      reconciliationItems,
      totalSucceeded,
      payoutFoundations,
      payoutGroups,
      stalePendingDonations,
      highValueDonations,
      suspendedFoundations,
    ] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.foundation.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.donationRequest.findMany({
        include: { foundation: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.donation.findMany({
        include: { foundation: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.auditLog.findMany({
        include: { actor: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.donation.groupBy({
        _count: { _all: true },
        by: ["status"],
      }),
      prisma.donation.groupBy({
        _count: { _all: true },
        _sum: { amountKobo: true },
        by: ["provider"],
        where: {
          status: "SUCCEEDED",
        },
      }),
      prisma.donation.findMany({
        include: {
          donationRequest: true,
          foundation: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 12,
        where: {
          status: {
            in: ["PENDING", "FAILED", "REFUNDED"],
          },
        },
      }),
      prisma.donation.aggregate({
        _sum: { amountKobo: true },
        where: {
          status: "SUCCEEDED",
        },
      }),
      prisma.foundation.findMany({
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          status: true,
        },
        take: 20,
        where: {
          status: "APPROVED",
        },
      }),
      prisma.donation.groupBy({
        _count: { _all: true },
        _sum: { amountKobo: true },
        by: ["foundationId", "status"],
        where: {
          status: {
            in: ["SUCCEEDED", "PENDING", "FAILED", "REFUNDED"],
          },
        },
      }),
      prisma.donation.findMany({
        include: {
          donationRequest: true,
          foundation: true,
        },
        orderBy: { createdAt: "asc" },
        take: 12,
        where: {
          createdAt: {
            lt: stalePendingCutoff,
          },
          status: "PENDING",
        },
      }),
      prisma.donation.findMany({
        include: {
          donationRequest: true,
          foundation: true,
        },
        orderBy: { amountKobo: "desc" },
        take: 12,
        where: {
          amountKobo: {
            gte: highValueReviewThresholdKobo,
          },
          status: "SUCCEEDED",
        },
      }),
      prisma.foundation.findMany({
        include: {
          user: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 12,
        where: {
          status: "SUSPENDED",
        },
      }),
    ]);

    const donationStatusCounts = {
      FAILED: 0,
      PENDING: 0,
      REFUNDED: 0,
      SUCCEEDED: 0,
    };

    for (const group of donationStatusGroups) {
      donationStatusCounts[group.status] = group._count._all;
    }

    const providerTotals = {
      LEMON_SQUEEZY: {
        count: 0,
        succeededKobo: 0,
      },
      PAYSTACK: {
        count: 0,
        succeededKobo: 0,
      },
    };

    for (const group of providerSucceededGroups) {
      providerTotals[group.provider] = {
        count: group._count._all,
        succeededKobo: group._sum.amountKobo ?? 0,
      };
    }

    const payoutReadiness = payoutFoundations.map((foundation) => {
      const groups = payoutGroups.filter(
        (group) => group.foundationId === foundation.id,
      );
      const succeededGroup = groups.find(
        (group) => group.status === "SUCCEEDED",
      );
      const pendingGroup = groups.find((group) => group.status === "PENDING");
      const failedGroup = groups.find((group) => group.status === "FAILED");
      const refundedGroup = groups.find((group) => group.status === "REFUNDED");
      const succeededKobo = succeededGroup?._sum.amountKobo ?? 0;
      const pendingCount = pendingGroup?._count._all ?? 0;
      const failedCount = failedGroup?._count._all ?? 0;

      return {
        failedCount,
        foundation,
        pendingCount,
        ready: succeededKobo > 0 && pendingCount === 0 && failedCount === 0,
        refundedKobo: refundedGroup?._sum.amountKobo ?? 0,
        succeededCount: succeededGroup?._count._all ?? 0,
        succeededKobo,
      };
    });
    const failedOrRefundedItems = reconciliationItems.filter((donation) =>
      ["FAILED", "REFUNDED"].includes(donation.status),
    );
    const incidentReviewItems = [
      ...suspendedFoundations.map((foundation) => ({
        id: `foundation:${foundation.id}`,
        label: foundation.name,
        reason: "Foundation suspended",
        severity: "high" as const,
        target: foundation.id,
        type: "FOUNDATION" as const,
      })),
      ...failedOrRefundedItems.slice(0, 6).map((donation) => ({
        id: `donation:${donation.id}`,
        label: donation.foundation.name,
        reason:
          donation.status === "FAILED"
            ? "Failed payment needs support review"
            : "Refunded gift needs reconciliation review",
        severity: "medium" as const,
        target: donation.id,
        type: "PAYMENT" as const,
      })),
      ...stalePendingDonations.slice(0, 6).map((donation) => ({
        id: `pending:${donation.id}`,
        label: donation.foundation.name,
        reason: "Stale pending payment",
        severity: "medium" as const,
        target: donation.id,
        type: "PAYMENT" as const,
      })),
      ...highValueDonations.slice(0, 6).map((donation) => ({
        id: `high-value:${donation.id}`,
        label: donation.foundation.name,
        reason: "High-value successful gift",
        severity: "low" as const,
        target: donation.id,
        type: "PAYMENT" as const,
      })),
    ].slice(0, 12);

    return {
      auditLogs,
      donations,
      donationStatusCounts,
      foundations,
      highValueDonations,
      highValueReviewThresholdKobo,
      incidentReviewItems,
      payoutReadiness,
      providerTotals,
      reconciliationItems,
      requests,
      stalePendingCutoff,
      stalePendingDonations,
      totalSucceededKobo: totalSucceeded._sum.amountKobo ?? 0,
      users,
    };
  }),
  restoreFoundation: permissionProcedure("admin:manage")
    .input(foundationIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await setFoundationStatus({
        action: "foundation.restored",
        actorId: ctx.auth.session.user.id,
        foundationId: input.foundationId,
        status: "APPROVED",
      });
    }),
  suspendFoundation: permissionProcedure("admin:manage")
    .input(foundationIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await setFoundationStatus({
        action: "foundation.suspended",
        actorId: ctx.auth.session.user.id,
        foundationId: input.foundationId,
        status: "SUSPENDED",
      });
    }),
});
