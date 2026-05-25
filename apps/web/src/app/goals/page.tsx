import { prisma } from "@al-infaaq/db";
import { Button } from "@al-infaaq/ui/button";
import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import Link from "next/link";
import { requireRole } from "@/lib/server-auth";
import { saveGivingGoal } from "./actions";

export default async function GoalsPage() {
  const session = await requireRole(["spender", "admin"]);
  const profile = await prisma.spenderProfile.findUnique({
    where: {
      userId: session.user.id,
    },
  });
  const successfulDonations = await prisma.donation.aggregate({
    _sum: {
      amountKobo: true,
    },
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
      spenderId: session.user.id,
      status: "SUCCEEDED",
    },
  });
  const donatedKobo = successfulDonations._sum.amountKobo ?? 0;
  const goalKobo = profile?.monthlyGoalKobo ?? 0;
  const progress =
    goalKobo > 0 ? Math.min(100, (donatedKobo / goalKobo) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-stone-950 sm:px-8">
      <section className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.6fr_0.4fr]">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500">Giving goals</p>
          <h1 className="mt-2 text-3xl font-semibold">Monthly sadaqah goal</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Set a private monthly target. Your wallet progress is visible only
            to you and platform systems needed for receipts and reconciliation.
          </p>

          <form action={saveGivingGoal} className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Monthly goal in NGN
              <input
                className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
                defaultValue={goalKobo ? goalKobo / 100 : ""}
                min="0"
                name="monthlyGoalNaira"
                step="1"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Reminder channel
              <select
                className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
                defaultValue={profile?.reminderChannel ?? "EMAIL"}
                name="reminderChannel"
              >
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-stone-800">
              <input
                defaultChecked={profile?.showSpendingHistory ?? false}
                name="showSpendingHistory"
                type="checkbox"
              />
              Show private giving history in wallet
            </label>
            <Button type="submit">Save goal</Button>
          </form>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-stone-500">This month</p>
          <p className="mt-2 text-3xl font-semibold">
            {formatNaira(donatedKobo / 100)}
          </p>
          <p className="mt-2 text-sm text-stone-600">
            of {formatNaira(goalKobo / 100)}
          </p>
          <div className="mt-5 h-2 rounded-full bg-stone-200">
            <div
              className="h-2 rounded-full bg-emerald-600"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Link
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-semibold"
            href="/wallet"
          >
            Open wallet
          </Link>
        </Card>
      </section>
    </main>
  );
}
