"use client";

import { Button } from "@al-infaaq/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpcClient } from "@/lib/trpc-client";

export function BannerGenerateButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function generateBanner() {
    setError(null);
    setIsPending(true);

    try {
      await trpcClient.requests.generateBanner.mutate({ requestId });
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to generate banner.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mt-5 grid gap-2 sm:flex sm:items-center">
      <Button disabled={isPending} onClick={generateBanner} type="button">
        {isPending ? "Generating..." : "Generate banner"}
      </Button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
