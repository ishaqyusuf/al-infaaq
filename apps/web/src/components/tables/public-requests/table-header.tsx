import type { PublicRequestRow } from "./columns";

export function PublicRequestsTableHeader({
  requests,
}: {
  requests: PublicRequestRow[];
}) {
  const fundedCount = requests.filter(
    (request) => request.status === "FUNDED",
  ).length;

  return (
    <div className="flex flex-col gap-3 border-b border-stone-200 dark:border-stone-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-semibold text-stone-950 dark:text-stone-50">
          Request discovery
        </h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {requests.length} public requests, {fundedCount} funded.
        </p>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Donor identity stays private.
      </p>
    </div>
  );
}
