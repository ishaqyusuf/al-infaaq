import type { TrusteeReviewRow } from "./columns";

export function TrusteeReviewsTableHeader({
  reviews,
}: {
  reviews: TrusteeReviewRow[];
}) {
  const pendingCount = reviews.filter(
    (review) => review.status === "PENDING",
  ).length;

  return (
    <div className="flex flex-col gap-3 border-b border-stone-200 dark:border-stone-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-semibold text-stone-950 dark:text-stone-50">
          Review queue
        </h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {reviews.length} total submissions, {pendingCount} pending.
        </p>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Trustees approve legitimacy, not funds.
      </p>
    </div>
  );
}
