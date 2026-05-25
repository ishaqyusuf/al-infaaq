import {
  createLemonSqueezyCheckout,
  initializePaystackTransaction,
} from "@al-infaaq/payments";
import { resolveAppUrl } from "@al-infaaq/utils";

import { createTRPCRouter, publicProcedure } from "../lib.trpc";
import {
  lemonSqueezyCheckoutInputSchema,
  paystackInitializeInputSchema,
} from "../schemas/payments.schema";

export const paymentsRouter = createTRPCRouter({
  createLemonSqueezyCheckout: publicProcedure
    .input(lemonSqueezyCheckoutInputSchema)
    .mutation(async ({ input }) => {
      return createLemonSqueezyCheckout(input);
    }),
  initializePaystack: publicProcedure
    .input(paystackInitializeInputSchema)
    .mutation(async ({ ctx, input }) => {
      const appUrl = resolveAppUrl({
        fallbackOrigin: ctx.headers.get("origin") ?? undefined,
      });

      return initializePaystackTransaction({
        amountKobo: input.amountKobo,
        callbackUrl: `${appUrl}/donations/complete`,
        email: input.email,
        metadata: {
          anonymousToFoundation: true,
          platform: "al-infaaq",
          requestId: input.requestId,
        },
        reference: input.reference,
      });
    }),
});
