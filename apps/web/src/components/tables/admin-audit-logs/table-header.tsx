import type { AdminAuditLogRow } from "./columns";

export function AdminAuditLogsTableHeader({
  auditLogs,
}: {
  auditLogs: AdminAuditLogRow[];
}) {
  return (
    <div className="border-b border-stone-200 dark:border-stone-800 px-5 py-4">
      <h2 className="font-semibold text-stone-950 dark:text-stone-50">
        Audit Log
      </h2>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
        {auditLogs.length} recent platform events.
      </p>
    </div>
  );
}
