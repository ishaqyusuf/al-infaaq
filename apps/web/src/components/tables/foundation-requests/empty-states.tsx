export function FoundationRequestsEmptyState() {
  return (
    <div className="border-t border-stone-200 dark:border-stone-800 px-5 py-10 text-center">
      <p className="text-sm font-medium text-stone-900">No requests yet</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-400">
        Create a draft request once your foundation is approved. Drafts stay
        private until you publish them.
      </p>
    </div>
  );
}
