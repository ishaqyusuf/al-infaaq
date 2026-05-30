"use client";

import { Button } from "@al-infaaq/ui/button";
import { Input } from "@al-infaaq/ui/input";
import { Label } from "@al-infaaq/ui/label";
import { Textarea } from "@al-infaaq/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpcClient } from "@/lib/trpc-client";

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

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function FoundationReviewForm({
  defaultValues,
}: FoundationReviewFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      await trpcClient.foundations.submitForReview.mutate({
        contactEmail: readFormString(formData, "contactEmail"),
        description: readFormString(formData, "description"),
        documentUrl: readFormString(formData, "documentUrl"),
        name: readFormString(formData, "name"),
        registrationNumber: readFormString(formData, "registrationNumber"),
        websiteUrl: readFormString(formData, "websiteUrl"),
      });
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
        <Label>
          Foundation name
          <Input defaultValue={defaultValues.name ?? ""} name="name" required />
        </Label>
        <Label>
          Description
          <Textarea
            className="min-h-32"
            defaultValue={defaultValues.description ?? ""}
            name="description"
            required
          />
        </Label>
        <div className="grid gap-5 md:grid-cols-2">
          <Label>
            Contact email
            <Input
              defaultValue={defaultValues.contactEmail ?? ""}
              name="contactEmail"
              type="email"
            />
          </Label>
          <Label>
            Registration number
            <Input
              defaultValue={defaultValues.registrationNumber ?? ""}
              name="registrationNumber"
            />
          </Label>
          <Label>
            Website URL
            <Input
              defaultValue={defaultValues.websiteUrl ?? ""}
              name="websiteUrl"
              type="url"
            />
          </Label>
          <Label>
            Document URL
            <Input
              defaultValue={defaultValues.documentUrl ?? ""}
              name="documentUrl"
              type="url"
            />
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
