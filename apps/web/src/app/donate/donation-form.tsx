"use client";

import { Button } from "@al-infaaq/ui/button";
import { Input } from "@al-infaaq/ui/input";
import { Label } from "@al-infaaq/ui/label";
import { Select } from "@al-infaaq/ui/select";
import type { FormEvent } from "react";
import { useState } from "react";
import { trpcClient } from "@/lib/trpc-client";

export function DonationForm({ requestId }: { requestId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const amountNaira = Number(formData.get("amountNaira") ?? 0);
    const providerValue = formData.get("provider");
    const provider =
      providerValue === "lemon_squeezy" ? "lemon_squeezy" : "paystack";

    try {
      const result = await trpcClient.donations.start.mutate({
        amountNaira: Number.isFinite(amountNaira) ? amountNaira : 0,
        provider,
        requestId,
      });
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
        <Label>
          Amount in NGN
          <Input min="1" name="amountNaira" required step="1" type="number" />
        </Label>
        <Label>
          Payment provider
          <Select name="provider">
            <option value="paystack">Paystack</option>
            <option value="lemon_squeezy">Lemon Squeezy</option>
          </Select>
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
