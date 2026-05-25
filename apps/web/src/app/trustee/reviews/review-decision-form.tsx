"use client";

import { Button } from "@al-infaaq/ui/button";
import { Textarea } from "@al-infaaq/ui/textarea";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { trpcClient } from "@/lib/trpc-client";

type ReviewDecisionFormProps = {
  reviewId: string;
};

export function ReviewDecisionForm({ reviewId }: ReviewDecisionFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<"approve" | "reject" | null>(null);

  async function decide(decision: "approve" | "reject") {
    setError(null);
    setIsPending(decision);

    const formData = new FormData(formRef.current ?? undefined);
    const notesValue = formData.get("notes");
    const notes =
      typeof notesValue === "string" && notesValue.trim()
        ? notesValue.trim()
        : undefined;

    try {
      if (decision === "approve") {
        await trpcClient.trustee.approveReview.mutate({ notes, reviewId });
      } else {
        await trpcClient.trustee.rejectReview.mutate({ notes, reviewId });
      }
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save review decision.",
      );
    } finally {
      setIsPending(null);
    }
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void decide("approve");
      }}
      ref={formRef}
    >
      <Textarea
        className="min-h-20"
        name="notes"
        placeholder="Decision notes"
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button disabled={isPending !== null} type="submit">
          {isPending === "approve" ? "Approving..." : "Approve"}
        </Button>
        <Button
          disabled={isPending !== null}
          onClick={() => {
            void decide("reject");
          }}
          type="button"
          variant="outline"
        >
          {isPending === "reject" ? "Rejecting..." : "Reject"}
        </Button>
      </div>
    </form>
  );
}
