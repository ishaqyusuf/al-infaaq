"use client";

import { Button } from "@al-infaaq/ui/button";
import { Input } from "@al-infaaq/ui/input";
import { Label } from "@al-infaaq/ui/label";
import { Textarea } from "@al-infaaq/ui/textarea";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DevFormQuickFillButton } from "@/components/dev/dev-form-quick-fill-button";
import { createQuickFillAdapter, QuickFill } from "@/components/dev/quick-fill";
import { trpcClient } from "@/lib/trpc-client";
import {
  type FoundationReviewFieldErrors,
  parseFoundationReviewFormData,
} from "./foundation-review-form.schema";

type FoundationReviewFormProps = {
  defaultValues: {
    contactEmail?: string | null;
    description?: string | null;
    documentUrl?: string | null;
    name?: string | null;
    registrationNumber?: string | null;
    websiteUrl?: string | null;
  };
};

export function FoundationReviewForm({
  defaultValues,
}: FoundationReviewFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FoundationReviewFieldErrors>(
    {},
  );
  const [isPending, setIsPending] = useState(false);
  const form = useForm({
    defaultValues: {
      contactEmail: defaultValues.contactEmail ?? "",
      description: defaultValues.description ?? "",
      documentUrl: defaultValues.documentUrl ?? "",
      name: defaultValues.name ?? "",
      registrationNumber: defaultValues.registrationNumber ?? "",
      websiteUrl: defaultValues.websiteUrl ?? "",
    },
  });
  const quickFill = new QuickFill(createQuickFillAdapter(form));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsPending(true);

    const parsed = parseFoundationReviewFormData(
      new FormData(event.currentTarget),
    );

    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setError("Check the highlighted fields and try again.");
      setIsPending(false);
      return;
    }

    try {
      await trpcClient.foundations.submitForReview.mutate(parsed.data);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to submit foundation review.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5">
        <div className="flex justify-end">
          <DevFormQuickFillButton
            onFill={() => quickFill.fill("foundation-review")}
          />
        </div>
        <Label>
          Foundation name
          <Input
            aria-invalid={Boolean(fieldErrors.name)}
            required
            {...form.register("name")}
          />
          {fieldErrors.name ? (
            <span className="text-xs font-normal text-red-700 dark:text-red-400">
              {fieldErrors.name}
            </span>
          ) : null}
        </Label>
        <Label>
          Description
          <Textarea
            aria-invalid={Boolean(fieldErrors.description)}
            className="min-h-32"
            required
            {...form.register("description")}
          />
          {fieldErrors.description ? (
            <span className="text-xs font-normal text-red-700 dark:text-red-400">
              {fieldErrors.description}
            </span>
          ) : null}
        </Label>
        <div className="grid gap-5 md:grid-cols-2">
          <Label>
            Contact email
            <Input
              aria-invalid={Boolean(fieldErrors.contactEmail)}
              type="email"
              {...form.register("contactEmail")}
            />
            {fieldErrors.contactEmail ? (
              <span className="text-xs font-normal text-red-700 dark:text-red-400">
                {fieldErrors.contactEmail}
              </span>
            ) : null}
          </Label>
          <Label>
            Registration number
            <Input
              aria-invalid={Boolean(fieldErrors.registrationNumber)}
              {...form.register("registrationNumber")}
            />
          </Label>
          <Label>
            Website URL
            <Input
              aria-invalid={Boolean(fieldErrors.websiteUrl)}
              type="url"
              {...form.register("websiteUrl")}
            />
            {fieldErrors.websiteUrl ? (
              <span className="text-xs font-normal text-red-700 dark:text-red-400">
                {fieldErrors.websiteUrl}
              </span>
            ) : null}
          </Label>
          <Label>
            Document URL
            <Input
              aria-invalid={Boolean(fieldErrors.documentUrl)}
              type="url"
              {...form.register("documentUrl")}
            />
            {fieldErrors.documentUrl ? (
              <span className="text-xs font-normal text-red-700 dark:text-red-400">
                {fieldErrors.documentUrl}
              </span>
            ) : null}
          </Label>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="flex justify-end">
          <Button disabled={isPending} type="submit">
            {isPending ? "Submitting..." : "Submit for Trustee review"}
          </Button>
        </div>
      </div>
    </form>
  );
}
