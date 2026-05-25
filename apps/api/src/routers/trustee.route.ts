import { prisma } from "@al-infaaq/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, permissionProcedure } from "../lib.trpc";

const decideReviewInputSchema = z.object({
  notes: z.string().trim().optional(),
  reviewId: z.string().min(1),
});

async function decideReview({
  actorId,
  notes,
  reviewId,
  status,
}: {
  actorId: string;
  notes?: string;
  reviewId: string;
  status: "APPROVED" | "REJECTED";
}) {
  const review = await prisma.trusteeReview.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Review not found.",
    });
  }

  await prisma.$transaction([
    prisma.trusteeReview.update({
      data: {
        decidedAt: new Date(),
        notes: notes || null,
        status,
        trusteeId: actorId,
      },
      where: {
        id: reviewId,
      },
    }),
    prisma.foundation.update({
      data: {
        status: status === "APPROVED" ? "APPROVED" : "REJECTED",
      },
      where: {
        id: review.foundationId,
      },
    }),
    prisma.auditLog.create({
      data: {
        action:
          status === "APPROVED"
            ? "foundation.trustee_review_approved"
            : "foundation.trustee_review_rejected",
        actorId,
        target: review.foundationId,
      },
    }),
  ]);
}

export const trusteeRouter = createTRPCRouter({
  reviews: permissionProcedure("foundations:approve").query(async () => {
    return await prisma.trusteeReview.findMany({
      include: {
        foundation: {
          include: {
            user: true,
          },
        },
        trustee: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }),
  approveReview: permissionProcedure("foundations:approve")
    .input(decideReviewInputSchema)
    .mutation(async ({ ctx, input }) => {
      await decideReview({
        actorId: ctx.auth.session.user.id,
        notes: input.notes,
        reviewId: input.reviewId,
        status: "APPROVED",
      });

      return { ok: true };
    }),
  rejectReview: permissionProcedure("foundations:approve")
    .input(decideReviewInputSchema)
    .mutation(async ({ ctx, input }) => {
      await decideReview({
        actorId: ctx.auth.session.user.id,
        notes: input.notes,
        reviewId: input.reviewId,
        status: "REJECTED",
      });

      return { ok: true };
    }),
});
