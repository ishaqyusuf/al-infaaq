"use client";

import { Button } from "@al-infaaq/ui/button";
import { Card } from "@al-infaaq/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <section className="mx-auto max-w-2xl">
        <Card className="p-5">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Something went wrong
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            This view could not be loaded.
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-400">
            Please try again. If the issue continues, the audit trail and
            payment records remain protected while the problem is investigated.
          </p>
          {error.digest ? (
            <p className="mt-4 break-all rounded-lg bg-stone-100 dark:bg-stone-900 px-3 py-2 text-xs text-stone-500 dark:bg-stone-900 dark:text-stone-400">
              Reference: {error.digest}
            </p>
          ) : null}
          <Button className="mt-5" onClick={reset} type="button">
            Try again
          </Button>
        </Card>
      </section>
    </main>
  );
}
