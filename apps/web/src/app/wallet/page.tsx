import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import { WalletDonationsDataTable } from "@/components/tables/wallet-donations/data-table";
import { requireRole } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  await requireRole(["spender", "admin"]);
  const trpc = await createServerTrpcCaller();
  const { donations, profile } = await trpc.donations.wallet();

  const totalSucceeded = donations
    .filter((donation) => donation.status === "SUCCEEDED")
    .reduce((total, donation) => total + donation.amountKobo, 0);

  return (
    <main className="min-h-screen bg-[#f7f5ef] dark:bg-[#11100d] px-5 py-8 text-stone-950 dark:text-stone-50 sm:px-8">
      <section className="mx-auto grid max-w-5xl gap-5">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-500">
            Giving wallet
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            {formatNaira(totalSucceeded / 100)} recorded
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-400">
            History display is {profile?.showSpendingHistory ? "on" : "hidden"}.
            Records remain available privately for receipts, reconciliation, and
            fraud protection.
          </p>
        </Card>

        {profile?.showSpendingHistory ? (
          <WalletDonationsDataTable donations={donations} />
        ) : (
          <Card className="p-5">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Private history is hidden in this wallet view.
            </p>
          </Card>
        )}
      </section>
    </main>
  );
}
