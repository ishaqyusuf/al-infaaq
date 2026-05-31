import { z } from "zod";

const donationFormSchema = z.object({
  amountNaira: z
    .number({ error: "Enter a valid donation amount." })
    .min(1, "Donation amount must be at least NGN 1."),
  provider: z.enum(["paystack", "lemon_squeezy"], {
    error: "Choose a payment provider.",
  }),
  requestId: z.string().min(1, "Choose a request to support."),
});

export type DonationFormData = z.infer<typeof donationFormSchema>;
export type DonationFieldErrors = Partial<
  Record<keyof DonationFormData, string>
>;

function readNumber(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}

function firstFieldErrors(
  error: z.ZodError<DonationFormData>,
): DonationFieldErrors {
  const flattened = error.flatten().fieldErrors;

  return {
    amountNaira: flattened.amountNaira?.[0],
    provider: flattened.provider?.[0],
    requestId: flattened.requestId?.[0],
  };
}

export function parseDonationFormData(
  formData: FormData,
  requestId: string,
):
  | { data: DonationFormData; success: true }
  | { fieldErrors: DonationFieldErrors; success: false } {
  const parsed = donationFormSchema.safeParse({
    amountNaira: readNumber(formData, "amountNaira"),
    provider: formData.get("provider"),
    requestId,
  });

  if (!parsed.success) {
    return {
      fieldErrors: firstFieldErrors(parsed.error),
      success: false,
    };
  }

  return {
    data: parsed.data,
    success: true,
  };
}
