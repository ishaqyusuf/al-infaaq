import { formatNaira } from "@al-infaaq/utils";
import { TableGrid, TableShell } from "../core/table-shell";
import {
  type AdminRequestRow,
  AdminRequestStatusBadge,
  adminRequestColumns,
} from "./columns";
import { AdminRequestsEmptyState } from "./empty-states";
import { AdminRequestsTableHeader } from "./table-header";

export function AdminRequestsDataTable({
  requests,
}: {
  requests: AdminRequestRow[];
}) {
  return (
    <TableShell>
      <AdminRequestsTableHeader requests={requests} />
      {requests.length === 0 ? (
        <AdminRequestsEmptyState />
      ) : (
        <div className="overflow-x-auto">
          <TableGrid className="grid-cols-[minmax(220px,1fr)_minmax(180px,1fr)_110px_180px]">
            {adminRequestColumns.map((column) => (
              <div
                className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 py-3 font-medium text-stone-600 dark:text-stone-400"
                key={column}
              >
                {column}
              </div>
            ))}
            {requests.map((request) => (
              <AdminRequestRowView key={request.id} request={request} />
            ))}
          </TableGrid>
        </div>
      )}
    </TableShell>
  );
}

function AdminRequestRowView({ request }: { request: AdminRequestRow }) {
  return (
    <>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 font-medium text-stone-950 dark:text-stone-50">
        {request.title}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 text-sm text-stone-600 dark:text-stone-400">
        {request.foundation.name}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <AdminRequestStatusBadge status={request.status} />
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 text-sm text-stone-700 dark:text-stone-300">
        {formatNaira(request.raisedKobo / 100)} of{" "}
        {formatNaira(request.targetKobo / 100)}
      </div>
    </>
  );
}
