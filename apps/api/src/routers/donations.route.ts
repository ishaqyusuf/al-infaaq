import { randomUUID } from "node:crypto";
import { prisma } from "@al-infaaq/db";
import {
  createLemonSqueezyCheckout,
  initializePaystackTransaction,
} from "@al-infaaq/payments";
import { nairaToKobo, resolveAppUrl } from "@al-infaaq/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, permissionProcedure } from "../lib.trpc";

const startDonationInputSchema = z.object({
  amountNaira: z.number().positive(),
  provider: z.enum(["paystack", "lemon_squeezy"]).default("paystack"),
  requestId: z.string().min(1),
});

export const donationsRouter = createTRPCRouter({
  wallet: permissionProcedure("donations:read-own").query(async ({ ctx }) => {
    const [profile, donations] = await Promise.all([
      prisma.spenderProfile.findUnique({
        where: {
          userId: ctx.auth.session.user.id,
        },
      }),
      prisma.donation.findMany({
        include: {
          donationRequest: true,
          foundation: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        where: {
          spenderId: ctx.auth.session.user.id,
        },
      }),
    ]);

    return {
      donations,
      profile,
    };
  }),
  start: permissionProcedure("donations:create")
    .input(startDonationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const request = await prisma.donationRequest.findFirst({
        include: {
          foundation: true,
        },
        where: {
          foundation: {
            status: "APPROVED",
          },
          id: input.requestId,
          status: "PUBLISHED",
        },
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Donation request is not available.",
        });
      }

      const amountKobo = nairaToKobo(input.amountNaira);
      const reference = `don_${randomUUID().replaceAll("-", "")}`;
      const paymentProvider =
        input.provider === "lemon_squeezy" ? "LEMON_SQUEEZY" : "PAYSTACK";

      await prisma.donation.create({
        data: {
          amountKobo,
          donationRequestId: request.id,
          foundationId: request.foundationId,
          provider: paymentProvider,
          providerReference: reference,
          spenderId: ctx.auth.session.user.id,
        },
      });

      if (paymentProvider === "LEMON_SQUEEZY") {
        const variantId = process.env.LEMONSQUEEZY_DONATION_VARIANT_ID;

        if (!variantId) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "LEMONSQUEEZY_DONATION_VARIANT_ID is not configured.",
          });
        }

        const checkout = await createLemonSqueezyCheckout({
          customPrice: amountKobo,
          donationReference: reference,
          email: ctx.auth.session.user.email,
          variantId,
        });

        const checkoutUrl = checkout?.data?.attributes?.url;

        if (!checkoutUrl) {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: "Lemon Squeezy checkout URL was not returned.",
          });
        }

        return { checkoutUrl };
      }

      const appUrl = resolveAppUrl({
        fallbackOrigin: ctx.headers.get("origin") ?? undefined,
      });

      const transaction = await initializePaystackTransaction({
        amountKobo,
        callbackUrl: `${appUrl}/donations/complete`,
        email: ctx.auth.session.user.email ?? "anonymous@al-infaaq.local",
        metadata: {
          anonymousToFoundation: true,
          donationReference: reference,
          platform: "al-infaaq",
          requestId: request.id,
        },
        reference,
      });

      if (!transaction?.authorization_url) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "Paystack authorization URL was not returned.",
        });
      }

      return { checkoutUrl: transaction.authorization_url };
    }),
});
