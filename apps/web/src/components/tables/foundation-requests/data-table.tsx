import { formatNaira } from "@al-infaaq/utils";
import { TableGrid, TableShell } from "../core/table-shell";
import { FoundationRequestActionMenu } from "./action-menu";
import {
  type FoundationRequestRow,
  FoundationRequestStatusBadge,
  foundationRequestColumns,
} from "./columns";
import { FoundationRequestsEmptyState } from "./empty-states";
import { FoundationRequestsTableHeader } from "./table-header";

export function FoundationRequestsDataTable({
  requests,
}: {
  requests: FoundationRequestRow[];
}) {
  return (
    <TableShell>
      <FoundationRequestsTableHeader requests={requests} />
      {requests.length === 0 ? (
        <FoundationRequestsEmptyState />
      ) : (
        <div className="overflow-x-auto">
          <TableGrid className="grid-cols-[minmax(260px,1.4fr)_120px_180px_130px_90px_220px]">
            {foundationRequestColumns.map((column) => (
              <div
                className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 py-3 font-medium text-stone-600 dark:text-stone-400"
                key={column}
              >
                {column}
              </div>
            ))}
            {requests.map((request) => (
              <FoundationRequestTableRow key={request.id} request={request} />
            ))}
          </TableGrid>
        </div>
      )}
    </TableShell>
  );
}

function FoundationRequestTableRow({
  request,
}: {
  request: FoundationRequestRow;
}) {
  return (
    <>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <p className="font-medium text-stone-950 dark:text-stone-50">
          {request.title}
        </p>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
          {request.story}
        </p>
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <FoundationRequestStatusBadge status={request.status} />
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <p className="font-medium text-stone-950 dark:text-stone-50">
          {formatNaira(request.raisedKobo / 100)}
        </p>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-500">
          of {formatNaira(request.targetKobo / 100)}
        </p>
        <div className="mt-3 h-2 rounded-full bg-stone-200">
          <div
            className="h-2 rounded-full bg-emerald-600"
            style={{ width: `${request.report.progressPercent}%` }}
          />
        </div>
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 font-medium text-stone-950 dark:text-stone-50">
        {request.report.statusCounts.SUCCEEDED}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 font-medium text-stone-950 dark:text-stone-50">
        {request.report.bannerCount}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <FoundationRequestActionMenu request={request} />
      </div>
    </>
  );
}
