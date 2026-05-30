export function TrusteeReviewsEmptyState() {
  return (
    <div className="border-t border-stone-200 dark:border-stone-800 px-5 py-10 text-center">
      <p className="text-sm font-medium text-stone-900">
        No foundation reviews are waiting
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-400">
        New foundation submissions appear here when they are ready for Trustee
        approval.
      </p>
    </div>
  );
}
