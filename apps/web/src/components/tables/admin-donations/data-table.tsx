import { formatNaira } from "@al-infaaq/utils";
import { TableGrid, TableShell } from "../core/table-shell";
import {
  type AdminDonationRow,
  AdminDonationStatusBadge,
  adminDonationColumns,
} from "./columns";
import { AdminDonationsEmptyState } from "./empty-states";
import { AdminDonationsTableHeader } from "./table-header";

export function AdminDonationsDataTable({
  donations,
  title,
}: {
  donations: AdminDonationRow[];
  title?: string;
}) {
  return (
    <TableShell>
      <AdminDonationsTableHeader donations={donations} title={title} />
      {donations.length === 0 ? (
        <AdminDonationsEmptyState />
      ) : (
        <div className="overflow-x-auto">
          <TableGrid className="grid-cols-[130px_minmax(180px,1fr)_110px_minmax(220px,1fr)]">
            {adminDonationColumns.map((column) => (
              <div
                className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 py-3 font-medium text-stone-600 dark:text-stone-400"
                key={column}
              >
                {column}
              </div>
            ))}
            {donations.map((donation) => (
              <AdminDonationRowView donation={donation} key={donation.id} />
            ))}
          </TableGrid>
        </div>
      )}
    </TableShell>
  );
}

function AdminDonationRowView({ donation }: { donation: AdminDonationRow }) {
  return (
    <>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 font-medium text-stone-950 dark:text-stone-50">
        {formatNaira(donation.amountKobo / 100)}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 text-sm text-stone-600 dark:text-stone-400">
        {donation.foundation.name}
        {donation.donationRequest ? (
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-500">
            {donation.donationRequest.title}
          </p>
        ) : null}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <AdminDonationStatusBadge status={donation.status} />
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 text-xs text-stone-500 dark:text-stone-500">
        <p className="break-all">
          {donation.provider}: {donation.providerReference}
        </p>
        {donation.updatedAt ? (
          <p className="mt-1">Updated {donation.updatedAt.toLocaleString()}</p>
        ) : null}
      </div>
    </>
  );
}
