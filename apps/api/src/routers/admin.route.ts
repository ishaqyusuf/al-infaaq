import { prisma } from "@al-infaaq/db";
import { z } from "zod";

import { createTRPCRouter, permissionProcedure } from "../lib.trpc";

const foundationIdInputSchema = z.object({
  foundationId: z.string().min(1),
});

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

    return {
      auditLogs,
      donations,
      donationStatusCounts,
      foundations,
      providerTotals,
      reconciliationItems,
      requests,
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
