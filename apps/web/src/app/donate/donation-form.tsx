"use client";

import { Button } from "@al-infaaq/ui/button";
import { Input } from "@al-infaaq/ui/input";
import { Label } from "@al-infaaq/ui/label";
import { Select } from "@al-infaaq/ui/select";
import type { FormEvent } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DevFormQuickFillButton } from "@/components/dev/dev-form-quick-fill-button";
import { createQuickFillAdapter, QuickFill } from "@/components/dev/quick-fill";
import { trpcClient } from "@/lib/trpc-client";
import {
  type DonationFieldErrors,
  parseDonationFormData,
} from "./donation-form.schema";

export function DonationForm({ requestId }: { requestId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<DonationFieldErrors>({});
  const [isPending, setIsPending] = useState(false);
  const form = useForm({
    defaultValues: {
      amountNaira: "",
      provider: "paystack",
    },
  });
  const quickFill = new QuickFill(createQuickFillAdapter(form));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsPending(true);

    const parsed = parseDonationFormData(
      new FormData(event.currentTarget),
      requestId,
    );

    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setError("Check the highlighted fields and try again.");
      setIsPending(false);
      return;
    }

    try {
      const result = await trpcClient.donations.start.mutate(parsed.data);
      window.location.assign(result.checkoutUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to start donation.",
      );
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5">
        <div className="flex justify-end">
          <DevFormQuickFillButton onFill={() => quickFill.fill("donation")} />
        </div>
        <Label>
          Amount in NGN
          <Input
            aria-invalid={Boolean(fieldErrors.amountNaira)}
            min="1"
            required
            step="1"
            type="number"
            {...form.register("amountNaira")}
          />
          {fieldErrors.amountNaira ? (
            <span className="text-xs font-normal text-red-700 dark:text-red-400">
              {fieldErrors.amountNaira}
            </span>
          ) : null}
        </Label>
        <Label>
          Payment provider
          <Select
            aria-invalid={Boolean(fieldErrors.provider)}
            {...form.register("provider")}
          >
            <option value="paystack">Paystack</option>
            <option value="lemon_squeezy">Lemon Squeezy</option>
          </Select>
          {fieldErrors.provider ? (
            <span className="text-xs font-normal text-red-700 dark:text-red-400">
              {fieldErrors.provider}
            </span>
          ) : null}
        </Label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button disabled={isPending} type="submit">
          {isPending ? "Opening payment..." : "Continue to payment"}
        </Button>
        <p className="text-xs leading-5 text-stone-500 dark:text-stone-500">
          The foundation will see the donation amount and request progress, not
          your name, email, or account identifier.
        </p>
      </div>
    </form>
  );
}
