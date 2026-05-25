"use client";

import { Button } from "@al-infaaq/ui/button";
import { Input } from "@al-infaaq/ui/input";
import { Label } from "@al-infaaq/ui/label";
import { Select } from "@al-infaaq/ui/select";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { trpcClient } from "@/lib/trpc-client";

type GivingGoalFormProps = {
  defaultValues: {
    monthlyGoalNaira: number | "";
    reminderChannel: "EMAIL" | "SMS" | "WHATSAPP";
    showSpendingHistory: boolean;
  };
};

export function GivingGoalForm({ defaultValues }: GivingGoalFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const monthlyGoalNaira = Number(formData.get("monthlyGoalNaira") ?? 0);
    const channelValue = formData.get("reminderChannel");
    const reminderChannel =
      channelValue === "SMS" || channelValue === "WHATSAPP"
        ? channelValue
        : "EMAIL";

    try {
      await trpcClient.goals.save.mutate({
        monthlyGoalNaira: Number.isFinite(monthlyGoalNaira)
          ? monthlyGoalNaira
          : 0,
        reminderChannel,
        showSpendingHistory: formData.get("showSpendingHistory") === "on",
      });
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
          min="0"
          name="monthlyGoalNaira"
          step="1"
          type="number"
        />
      </Label>
      <Label>
        Reminder channel
        <Select
          defaultValue={defaultValues.reminderChannel}
          name="reminderChannel"
        >
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
          <option value="WHATSAPP">WhatsApp</option>
        </Select>
      </Label>
      <label className="flex items-center gap-3 text-sm font-medium text-stone-800">
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
