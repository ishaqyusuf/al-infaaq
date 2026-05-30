import { formatNaira } from "@al-infaaq/utils";
import type { FoundationRequestRow } from "./columns";

export function FoundationRequestsTableHeader({
  requests,
}: {
  requests: FoundationRequestRow[];
}) {
  const totalRaisedKobo = requests.reduce(
    (sum, request) => sum + request.raisedKobo,
    0,
  );
  const publishedCount = requests.filter(
    (request) => request.status === "PUBLISHED",
  ).length;

  return (
    <div className="flex flex-col gap-3 border-b border-stone-200 dark:border-stone-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-semibold text-stone-950 dark:text-stone-50">
          Request pipeline
        </h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {requests.length} total requests, {publishedCount} live.
        </p>
      </div>
      <div className="text-sm text-stone-600 dark:text-stone-400">
        <span className="font-semibold text-stone-950 dark:text-stone-50">
          {formatNaira(totalRaisedKobo / 100)}
        </span>{" "}
        raised
      </div>
    </div>
  );
}
