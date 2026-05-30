import { formatNaira } from "@al-infaaq/utils";
import { TableGrid, TableShell } from "../core/table-shell";
import {
  type WalletDonationRow,
  WalletDonationStatusBadge,
  walletDonationColumns,
} from "./columns";
import { WalletDonationsEmptyState } from "./empty-states";
import { WalletDonationsTableHeader } from "./table-header";

export function WalletDonationsDataTable({
  donations,
}: {
  donations: WalletDonationRow[];
}) {
  return (
    <TableShell>
      <WalletDonationsTableHeader donations={donations} />
      {donations.length === 0 ? (
        <WalletDonationsEmptyState />
      ) : (
        <div className="overflow-x-auto">
          <TableGrid className="grid-cols-[minmax(220px,1fr)_minmax(180px,1fr)_130px_110px]">
            {walletDonationColumns.map((column) => (
              <div
                className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 py-3 font-medium text-stone-600 dark:text-stone-400"
                key={column}
              >
                {column}
              </div>
            ))}
            {donations.map((donation) => (
              <WalletDonationRowView donation={donation} key={donation.id} />
            ))}
          </TableGrid>
        </div>
      )}
    </TableShell>
  );
}

function WalletDonationRowView({ donation }: { donation: WalletDonationRow }) {
  return (
    <>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 font-medium text-stone-950 dark:text-stone-50">
        {donation.donationRequest?.title ?? donation.foundation.name}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 text-sm text-stone-600 dark:text-stone-400">
        {donation.foundation.name}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4 font-medium text-stone-950 dark:text-stone-50">
        {formatNaira(donation.amountKobo / 100)}
      </div>
      <div className="border-b border-stone-100 dark:border-stone-900 px-4 py-4">
        <WalletDonationStatusBadge status={donation.status} />
      </div>
    </>
  );
}
