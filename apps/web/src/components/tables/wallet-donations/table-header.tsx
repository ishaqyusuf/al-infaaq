import { formatNaira } from "@al-infaaq/utils";
import type { WalletDonationRow } from "./columns";

export function WalletDonationsTableHeader({
  donations,
}: {
  donations: WalletDonationRow[];
}) {
  const totalSucceededKobo = donations
    .filter((donation) => donation.status === "SUCCEEDED")
    .reduce((total, donation) => total + donation.amountKobo, 0);

  return (
    <div className="flex flex-col gap-3 border-b border-stone-200 dark:border-stone-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-semibold text-stone-950 dark:text-stone-50">
          Private history
        </h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {donations.length} wallet records.
        </p>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        <span className="font-semibold text-stone-950 dark:text-stone-50">
          {formatNaira(totalSucceededKobo / 100)}
        </span>{" "}
        completed
      </p>
    </div>
  );
}
