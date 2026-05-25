import { z } from "zod";

export const paystackInitializeInputSchema = z.object({
  amountKobo: z.number().int().positive(),
  email: z.email(),
  reference: z.string().min(8),
  requestId: z.string().optional(),
});

export const lemonSqueezyCheckoutInputSchema = z.object({
  customPrice: z.number().int().positive().optional(),
  donationReference: z.string().min(8),
  email: z.email().optional(),
  variantId: z.string().min(1),
});
