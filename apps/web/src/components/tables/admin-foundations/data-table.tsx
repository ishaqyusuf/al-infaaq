import { TableGrid, TableShell } from "../core/table-shell";
import { AdminFoundationActionMenu } from "./action-menu";
import {
  type AdminFoundationRow,
  AdminFoundationStatusBadge,
  adminFoundationColumns,
} from "./columns";
import { AdminFoundationsEmptyState } from "./empty-states";
import { AdminFoundationsTableHeader } from "./table-header";

export function AdminFoundationsDataTable({
  foundations,
}: {
  foundations: AdminFoundationRow[];
}) {
  return (
    <TableShell>
      <AdminFoundationsTableHeader foundations={foundations} />
      {foundations.length === 0 ? (
        <AdminFoundationsEmptyState />
      ) : (
        <div className="overflow-x-auto">
          <TableGrid className="grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_120px_140px]">
            {adminFoundationColumns.map((column) => (
              <div
                className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 py-3 font-medium text-stone-600 dark:text-stone-400"
                key={column}
              >
                {column}
              </div>
            ))}
            {foundations.map((foundation) => (
              <AdminFoundationRowView
                foundation={foundation}
                key={foundation.id}
              />
            ))}
          </TableGrid>
        </div>
      )}
    </TableShell>
  );
}

function AdminFoundationRowView({
  foundation,
}: {
  foundation: AdminFoundationRow;
}) {
  return (
    <>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 font-medium text-stone-950 dark:text-stone-50">
        {foundation.name}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 text-sm text-stone-600 dark:text-stone-400">
        {foundation.user.email ?? "No email"}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <AdminFoundationStatusBadge status={foundation.status} />
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <AdminFoundationActionMenu foundation={foundation} />
      </div>
    </>
  );
}
