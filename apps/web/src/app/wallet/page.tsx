import { prisma } from "@al-infaaq/db";
import { Badge } from "@al-infaaq/ui/badge";
import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import { requireRole } from "@/lib/server-auth";

export default async function WalletPage() {
  const session = await requireRole(["spender", "admin"]);
  const profile = await prisma.spenderProfile.findUnique({
    where: {
      userId: session.user.id,
    },
  });
  const donations = await prisma.donation.findMany({
    include: {
      donationRequest: true,
      foundation: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    where: {
      spenderId: session.user.id,
    },
  });

  const totalSucceeded = donations
    .filter((donation) => donation.status === "SUCCEEDED")
    .reduce((total, donation) => total + donation.amountKobo, 0);

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-stone-950 sm:px-8">
      <section className="mx-auto grid max-w-5xl gap-5">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500">Giving wallet</p>
          <h1 className="mt-2 text-3xl font-semibold">
            {formatNaira(totalSucceeded / 100)} recorded
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            History display is {profile?.showSpendingHistory ? "on" : "hidden"}.
            Records remain available privately for receipts, reconciliation, and
            fraud protection.
          </p>
        </Card>

        {profile?.showSpendingHistory ? (
          <div className="grid gap-4">
            {donations.length === 0 ? (
              <Card className="p-5">
                <p className="text-sm text-stone-600">
                  No donations have been recorded yet.
                </p>
              </Card>
            ) : null}

            {donations.map((donation) => (
              <Card className="p-5" key={donation.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {donation.donationRequest?.title ??
                        donation.foundation.name}
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                      {donation.foundation.name}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xl font-semibold">
                      {formatNaira(donation.amountKobo / 100)}
                    </p>
                    <Badge className="mt-2 bg-stone-100 text-stone-900">
                      {donation.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-5">
            <p className="text-sm text-stone-600">
              Private history is hidden in this wallet view.
            </p>
          </Card>
        )}
      </section>
    </main>
  );
}
