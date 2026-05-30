import { TableGrid, TableShell } from "../core/table-shell";

const skeletonCells = ["request", "foundation", "progress", "status"];

export function PublicRequestsTableSkeleton() {
  return (
    <TableShell>
      <div className="border-b border-stone-200 dark:border-stone-800 px-5 py-4">
        <div className="h-4 w-32 rounded bg-stone-200" />
      </div>
      <div className="overflow-x-auto">
        <TableGrid className="grid-cols-[minmax(260px,1.4fr)_minmax(180px,1fr)_220px_160px]">
          {skeletonCells.map((cell) => (
            <div
              className="h-12 border-b border-stone-100 dark:border-stone-900 px-4 py-3"
              key={cell}
            >
              <div className="h-3 rounded bg-stone-200" />
            </div>
          ))}
        </TableGrid>
      </div>
    </TableShell>
  );
}
