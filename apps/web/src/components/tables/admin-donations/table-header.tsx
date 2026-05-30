import type { AdminDonationRow } from "./columns";

export function AdminDonationsTableHeader({
  donations,
  title = "Donations",
}: {
  donations: AdminDonationRow[];
  title?: string;
}) {
  return (
    <div className="border-b border-stone-200 dark:border-stone-800 px-5 py-4">
      <h2 className="font-semibold text-stone-950 dark:text-stone-50">
        {title}
      </h2>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
        {donations.length} recent records.
      </p>
    </div>
  );
}
