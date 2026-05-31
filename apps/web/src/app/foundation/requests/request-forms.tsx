"use client";

import { Button } from "@al-infaaq/ui/button";
import { Input } from "@al-infaaq/ui/input";
import { Label } from "@al-infaaq/ui/label";
import { Textarea } from "@al-infaaq/ui/textarea";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { trpcClient } from "@/lib/trpc-client";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(formData: FormData, key: string) {
  const parsed = Number(readString(formData, key));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function CreateRequestForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await trpcClient.requests.create.mutate({
        story: readString(formData, "story"),
        targetNaira: readNumber(formData, "targetNaira"),
        title: readString(formData, "title"),
      });
      form.reset();
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create request.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5">
        <h2 className="text-xl font-semibold">Create request</h2>
        <Label>
          Title
          <Input name="title" required />
        </Label>
        <Label>
          Story
          <Textarea className="min-h-28" name="story" required />
        </Label>
        <Label>
          Target amount in NGN
          <Input min="1" name="targetNaira" required step="1" type="number" />
        </Label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="flex justify-end">
          <Button disabled={isPending} type="submit">
            {isPending ? "Creating..." : "Create draft"}
          </Button>
        </div>
      </div>
    </form>
  );
}
