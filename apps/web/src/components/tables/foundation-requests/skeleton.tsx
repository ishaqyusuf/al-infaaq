import { TableGrid, TableShell } from "../core/table-shell";

const skeletonCells = [
  "request-1",
  "status-1",
  "progress-1",
  "completed-1",
  "banners-1",
  "actions-1",
  "request-2",
  "status-2",
  "progress-2",
  "completed-2",
  "banners-2",
  "actions-2",
  "request-3",
  "status-3",
  "progress-3",
  "completed-3",
  "banners-3",
  "actions-3",
];

export function FoundationRequestsTableSkeleton() {
  return (
    <TableShell>
      <div className="border-b border-stone-200 dark:border-stone-800 px-5 py-4">
        <div className="h-4 w-36 rounded bg-stone-200" />
      </div>
      <div className="overflow-x-auto">
        <TableGrid className="grid-cols-[minmax(260px,1.4fr)_120px_180px_130px_90px_220px]">
          {skeletonCells.map((cell) => (
            <div
              className="h-12 border-b border-stone-100 dark:border-stone-900 px-4 py-3"
              key={`foundation-request-skeleton-${cell}`}
            >
              <div className="h-3 rounded bg-stone-200" />
            </div>
          ))}
        </TableGrid>
      </div>
    </TableShell>
  );
}
