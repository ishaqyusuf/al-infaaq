import { TableGrid, TableShell } from "../core/table-shell";
import { type AdminAuditLogRow, adminAuditLogColumns } from "./columns";
import { AdminAuditLogsEmptyState } from "./empty-states";
import { AdminAuditLogsTableHeader } from "./table-header";

export function AdminAuditLogsDataTable({
  auditLogs,
}: {
  auditLogs: AdminAuditLogRow[];
}) {
  return (
    <TableShell>
      <AdminAuditLogsTableHeader auditLogs={auditLogs} />
      {auditLogs.length === 0 ? (
        <AdminAuditLogsEmptyState />
      ) : (
        <div className="overflow-x-auto">
          <TableGrid className="grid-cols-[minmax(180px,1fr)_minmax(220px,1fr)_minmax(180px,1fr)_170px]">
            {adminAuditLogColumns.map((column) => (
              <div
                className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 py-3 font-medium text-stone-600 dark:text-stone-400"
                key={column}
              >
                {column}
              </div>
            ))}
            {auditLogs.map((log) => (
              <AdminAuditLogRowView key={log.id} log={log} />
            ))}
          </TableGrid>
        </div>
      )}
    </TableShell>
  );
}

function AdminAuditLogRowView({ log }: { log: AdminAuditLogRow }) {
  return (
    <>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 font-medium text-stone-950 dark:text-stone-50">
        {log.action}
      </div>
      <div className="break-all border-b border-stone-100 dark:border-stone-900 px-4 py-4 text-xs text-stone-500 dark:text-stone-500">
        {log.target}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 text-sm text-stone-600 dark:text-stone-400">
        {log.actor?.email ?? "System"}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 text-sm text-stone-600 dark:text-stone-400">
        {log.createdAt.toLocaleString()}
      </div>
    </>
  );
}
