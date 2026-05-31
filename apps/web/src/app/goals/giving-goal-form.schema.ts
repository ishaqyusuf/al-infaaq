import { z } from "zod";

const reminderChannelSchema = z.enum(["EMAIL", "SMS", "WHATSAPP"], {
  error: "Choose a reminder channel.",
});

const givingGoalFormSchema = z.object({
  monthlyGoalNaira: z
    .number({ error: "Enter a valid monthly goal." })
    .min(0, "Monthly goal cannot be negative."),
  reminderChannel: reminderChannelSchema,
  remindersEnabled: z.boolean(),
  showSpendingHistory: z.boolean(),
});

export type GivingGoalFormData = z.infer<typeof givingGoalFormSchema>;
export type GivingGoalFieldErrors = Partial<
  Record<keyof GivingGoalFormData, string>
>;

function readNumber(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim() === "") {
    return 0;
  }

  return Number(value);
}

function firstFieldErrors(
  error: z.ZodError<GivingGoalFormData>,
): GivingGoalFieldErrors {
  const flattened = error.flatten().fieldErrors;

  return {
    monthlyGoalNaira: flattened.monthlyGoalNaira?.[0],
    reminderChannel: flattened.reminderChannel?.[0],
    remindersEnabled: flattened.remindersEnabled?.[0],
    showSpendingHistory: flattened.showSpendingHistory?.[0],
  };
}

export function parseGivingGoalFormData(
  formData: FormData,
):
  | { data: GivingGoalFormData; success: true }
  | { fieldErrors: GivingGoalFieldErrors; success: false } {
  const parsed = givingGoalFormSchema.safeParse({
    monthlyGoalNaira: readNumber(formData, "monthlyGoalNaira"),
    reminderChannel: formData.get("reminderChannel"),
    remindersEnabled: formData.get("remindersEnabled") === "on",
    showSpendingHistory: formData.get("showSpendingHistory") === "on",
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
