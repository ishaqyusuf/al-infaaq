import type { AdminFoundationRow } from "./columns";

export function AdminFoundationsTableHeader({
  foundations,
}: {
  foundations: AdminFoundationRow[];
}) {
  const suspendedCount = foundations.filter(
    (foundation) => foundation.status === "SUSPENDED",
  ).length;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 px-5 py-4">
      <div>
        <h2 className="font-semibold text-stone-950 dark:text-stone-50">
          Foundations
        </h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {foundations.length} recent, {suspendedCount} suspended.
        </p>
      </div>
    </div>
  );
}
