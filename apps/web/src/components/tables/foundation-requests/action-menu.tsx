"use client";

import { Button, buttonVariants } from "@al-infaaq/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpcClient } from "@/lib/trpc-client";
import type { FoundationRequestRow } from "./columns";

export function FoundationRequestActionMenu({
  request,
}: {
  request: FoundationRequestRow;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function mutate(variant: "archive" | "publish") {
    setError(null);
    setIsPending(true);

    try {
      if (variant === "archive") {
        await trpcClient.requests.archive.mutate({ requestId: request.id });
      } else {
        await trpcClient.requests.publish.mutate({ requestId: request.id });
      }
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update request.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {request.status === "DRAFT" ? (
          <Button
            disabled={isPending}
            onClick={() => {
              void mutate("publish");
            }}
            size="sm"
            type="button"
          >
            {isPending ? "Saving..." : "Publish"}
          </Button>
        ) : (
          <>
            {request.status !== "ARCHIVED" ? (
              <Button
                disabled={isPending}
                onClick={() => {
                  void mutate("archive");
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                {isPending ? "Saving..." : "Archive"}
              </Button>
            ) : null}
            <Link
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href={`/foundation/requests/${request.id}/banner`}
            >
              Banner
            </Link>
            <Link
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href={`/foundation/requests/${request.id}/report`}
            >
              Report
            </Link>
            <Link
              className={buttonVariants({ size: "sm" })}
              href={`/requests/${request.id}`}
            >
              Public page
            </Link>
          </>
        )}
      </div>
      {error ? (
        <p className="max-w-56 justify-self-end text-right text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
