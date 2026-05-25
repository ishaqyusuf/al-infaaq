"use client";

import { Button } from "@al-infaaq/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpcClient } from "@/lib/trpc-client";

export function FoundationStatusButton({
  foundationId,
  isSuspended,
}: {
  foundationId: string;
  isSuspended: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function updateStatus() {
    setError(null);
    setIsPending(true);

    try {
      if (isSuspended) {
        await trpcClient.admin.restoreFoundation.mutate({ foundationId });
      } else {
        await trpcClient.admin.suspendFoundation.mutate({ foundationId });
      }
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update foundation.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mt-3 grid gap-2">
      <Button
        disabled={isPending}
        onClick={() => {
          void updateStatus();
        }}
        type="button"
        variant={isSuspended ? "default" : "outline"}
      >
        {isPending ? "Saving..." : isSuspended ? "Restore" : "Suspend"}
      </Button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
