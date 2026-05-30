import { formatNaira } from "@al-infaaq/utils";
import Link from "next/link";
import { TableGrid, TableShell } from "../core/table-shell";
import {
  type PublicRequestRow,
  PublicRequestStatusBadge,
  publicRequestColumns,
} from "./columns";
import { PublicRequestsEmptyState } from "./empty-states";
import { PublicRequestsTableHeader } from "./table-header";

export function PublicRequestsDataTable({
  requests,
}: {
  requests: PublicRequestRow[];
}) {
  return (
    <TableShell>
      <PublicRequestsTableHeader requests={requests} />
      {requests.length === 0 ? (
        <PublicRequestsEmptyState />
      ) : (
        <div className="overflow-x-auto">
          <TableGrid className="grid-cols-[minmax(260px,1.4fr)_minmax(180px,1fr)_220px_160px]">
            {publicRequestColumns.map((column) => (
              <div
                className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 py-3 font-medium text-stone-600 dark:text-stone-400"
                key={column}
              >
                {column}
              </div>
            ))}
            {requests.map((request) => (
              <PublicRequestRowView key={request.id} request={request} />
            ))}
          </TableGrid>
        </div>
      )}
    </TableShell>
  );
}

function PublicRequestRowView({ request }: { request: PublicRequestRow }) {
  const progress =
    request.targetKobo > 0
      ? Math.min(100, (request.raisedKobo / request.targetKobo) * 100)
      : 0;

  return (
    <>
      <Link
        className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 hover:bg-stone-50 dark:bg-stone-900"
        href={`/requests/${request.id}`}
      >
        <p className="font-medium text-stone-950 dark:text-stone-50">
          {request.title}
        </p>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
          {request.story}
        </p>
      </Link>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 text-sm text-stone-600 dark:text-stone-400">
        {request.foundation.name}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <p className="text-sm text-stone-700 dark:text-stone-300">
          {formatNaira(request.raisedKobo / 100)} of{" "}
          {formatNaira(request.targetKobo / 100)}
        </p>
        <div className="mt-3 h-2 rounded-full bg-stone-200">
          <div
            className="h-2 rounded-full bg-emerald-600"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <PublicRequestStatusBadge status={request.status} />
      </div>
    </>
  );
}
