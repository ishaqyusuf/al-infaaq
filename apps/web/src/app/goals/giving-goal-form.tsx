"use client";

import { Button } from "@al-infaaq/ui/button";
import { Input } from "@al-infaaq/ui/input";
import { Label } from "@al-infaaq/ui/label";
import { Select } from "@al-infaaq/ui/select";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { trpcClient } from "@/lib/trpc-client";
import {
  type GivingGoalFieldErrors,
  parseGivingGoalFormData,
} from "./giving-goal-form.schema";

type GivingGoalFormProps = {
  defaultValues: {
    monthlyGoalNaira: number | "";
    reminderChannel: "EMAIL" | "SMS" | "WHATSAPP";
    remindersEnabled: boolean;
    showSpendingHistory: boolean;
  };
};

export function GivingGoalForm({ defaultValues }: GivingGoalFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<GivingGoalFieldErrors>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsPending(true);

    const parsed = parseGivingGoalFormData(new FormData(event.currentTarget));

    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setError("Check the highlighted fields and try again.");
      setIsPending(false);
      return;
    }

    try {
      await trpcClient.goals.save.mutate(parsed.data);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save goal.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
      <Label>
        Monthly goal in NGN
        <Input
          defaultValue={defaultValues.monthlyGoalNaira}
          aria-invalid={Boolean(fieldErrors.monthlyGoalNaira)}
          min="0"
          name="monthlyGoalNaira"
          step="1"
          type="number"
        />
        {fieldErrors.monthlyGoalNaira ? (
          <span className="text-xs font-normal text-red-700 dark:text-red-400">
            {fieldErrors.monthlyGoalNaira}
          </span>
        ) : null}
      </Label>
      <Label>
        Reminder channel
        <Select
          aria-invalid={Boolean(fieldErrors.reminderChannel)}
          defaultValue={defaultValues.reminderChannel}
          name="reminderChannel"
        >
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
          <option value="WHATSAPP">WhatsApp</option>
        </Select>
        {fieldErrors.reminderChannel ? (
          <span className="text-xs font-normal text-red-700 dark:text-red-400">
            {fieldErrors.reminderChannel}
          </span>
        ) : null}
      </Label>
      <label className="flex items-center gap-3 text-sm font-medium text-stone-800 dark:text-stone-100">
        <input
          defaultChecked={defaultValues.remindersEnabled}
          name="remindersEnabled"
          type="checkbox"
        />
        Send monthly giving reminders
      </label>
      <label className="flex items-center gap-3 text-sm font-medium text-stone-800 dark:text-stone-100">
        <input
          defaultChecked={defaultValues.showSpendingHistory}
          name="showSpendingHistory"
          type="checkbox"
        />
        Show private giving history in wallet
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save goal"}
      </Button>
    </form>
  );
}
