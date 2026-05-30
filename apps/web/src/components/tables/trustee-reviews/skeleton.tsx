import { TableGrid, TableShell } from "../core/table-shell";

const skeletonCells = [
  "foundation-1",
  "status-1",
  "evidence-1",
  "decision-1",
  "actions-1",
  "foundation-2",
  "status-2",
  "evidence-2",
  "decision-2",
  "actions-2",
];

export function TrusteeReviewsTableSkeleton() {
  return (
    <TableShell>
      <div className="border-b border-stone-200 dark:border-stone-800 px-5 py-4">
        <div className="h-4 w-32 rounded bg-stone-200" />
      </div>
      <div className="overflow-x-auto">
        <TableGrid className="grid-cols-[minmax(240px,1.2fr)_120px_minmax(260px,1.4fr)_180px_260px]">
          {skeletonCells.map((cell) => (
            <div
              className="h-12 border-b border-stone-100 dark:border-stone-900 px-4 py-3"
              key={`trustee-review-skeleton-${cell}`}
            >
              <div className="h-3 rounded bg-stone-200" />
            </div>
          ))}
        </TableGrid>
      </div>
    </TableShell>
  );
}
