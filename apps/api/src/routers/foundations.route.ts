import { prisma } from "@al-infaaq/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, permissionProcedure } from "../lib.trpc";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const submitFoundationInputSchema = z.object({
  contactEmail: z.email().optional().or(z.literal("")),
  description: z.string().trim().min(1),
  documentUrl: z.url().optional().or(z.literal("")),
  name: z.string().trim().min(1),
  registrationNumber: z.string().trim().optional(),
  websiteUrl: z.url().optional().or(z.literal("")),
});

export const foundationsRouter = createTRPCRouter({
  current: permissionProcedure("foundations:apply").query(async ({ ctx }) => {
    return await prisma.foundation.findUnique({
      where: {
        userId: ctx.auth.session.user.id,
      },
    });
  }),
  submitForReview: permissionProcedure("foundations:apply")
    .input(submitFoundationInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.auth.session.user.role !== "spender" &&
        ctx.auth.session.user.role !== "foundation"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only spender or foundation accounts can submit reviews.",
        });
      }

      const foundation = await prisma.foundation.upsert({
        create: {
          contactEmail: input.contactEmail || ctx.auth.session.user.email,
          description: input.description,
          documentUrl: input.documentUrl || null,
          name: input.name,
          registrationNumber: input.registrationNumber || null,
          slug: slugify(input.name),
          status: "PENDING_REVIEW",
          userId: ctx.auth.session.user.id,
          websiteUrl: input.websiteUrl || null,
        },
        update: {
          contactEmail: input.contactEmail || ctx.auth.session.user.email,
          description: input.description,
          documentUrl: input.documentUrl || null,
          name: input.name,
          registrationNumber: input.registrationNumber || null,
          status: "PENDING_REVIEW",
          websiteUrl: input.websiteUrl || null,
        },
        where: {
          userId: ctx.auth.session.user.id,
        },
      });

      await prisma.user.update({
        data: {
          role: "FOUNDATION",
        },
        where: {
          id: ctx.auth.session.user.id,
        },
      });

      const existingPendingReview = await prisma.trusteeReview.findFirst({
        where: {
          foundationId: foundation.id,
          status: "PENDING",
        },
      });

      if (!existingPendingReview) {
        await prisma.trusteeReview.create({
          data: {
            foundationId: foundation.id,
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          action: "foundation.submitted_for_trustee_review",
          actorId: ctx.auth.session.user.id,
          target: foundation.id,
        },
      });

      return foundation;
    }),
});
