"use client";

import { Button } from "@al-infaaq/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpcClient } from "@/lib/trpc-client";
import type { AdminFoundationRow } from "./columns";

export function AdminFoundationActionMenu({
  foundation,
}: {
  foundation: AdminFoundationRow;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isSuspended = foundation.status === "SUSPENDED";

  async function updateStatus() {
    setError(null);
    setIsPending(true);

    try {
      if (isSuspended) {
        await trpcClient.admin.restoreFoundation.mutate({
          foundationId: foundation.id,
        });
      } else {
        await trpcClient.admin.suspendFoundation.mutate({
          foundationId: foundation.id,
        });
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
    <div className="grid justify-items-end gap-2">
      <Button
        disabled={isPending}
        onClick={() => {
          void updateStatus();
        }}
        size="sm"
        type="button"
        variant={isSuspended ? "default" : "outline"}
      >
        {isPending ? "Saving..." : isSuspended ? "Restore" : "Suspend"}
      </Button>
      {error ? (
        <p className="max-w-48 text-right text-xs text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
