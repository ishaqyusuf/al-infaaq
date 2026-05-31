import { buttonVariants } from "@al-infaaq/ui/button";
import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import Link from "next/link";
import { requireRole } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";
import { GivingGoalForm } from "./giving-goal-form";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  await requireRole(["spender", "admin"]);
  const trpc = await createServerTrpcCaller();
  const { donatedKobo, nextReminder, profile } = await trpc.goals.summary();
  const goalKobo = profile?.monthlyGoalKobo ?? 0;
  const progress =
    goalKobo > 0 ? Math.min(100, (donatedKobo / goalKobo) * 100) : 0;

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <section className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.6fr_0.4fr]">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-500">
            Giving goals
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Monthly sadaqah goal</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-400">
            Set a private monthly target. Your wallet progress is visible only
            to you and platform systems needed for receipts and reconciliation.
          </p>

          <GivingGoalForm
            defaultValues={{
              monthlyGoalNaira: goalKobo ? goalKobo / 100 : "",
              reminderChannel: profile?.reminderChannel ?? "EMAIL",
              remindersEnabled: profile?.remindersEnabled ?? true,
              showSpendingHistory: profile?.showSpendingHistory ?? false,
            }}
          />
        </Card>

        <Card className="p-5">
          <p className="text-sm text-stone-500 dark:text-stone-500">
            This month
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {formatNaira(donatedKobo / 100)}
          </p>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            of {formatNaira(goalKobo / 100)}
          </p>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
            Next reminder:{" "}
            {nextReminder
              ? nextReminder.scheduledAt.toLocaleString()
              : "Paused"}
          </p>
          <div className="mt-5 h-2 rounded-full bg-stone-200">
            <div
              className="h-2 rounded-full bg-emerald-600"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Link
            className={buttonVariants({
              className: "mt-6",
              variant: "outline",
            })}
            href="/wallet"
          >
            Open wallet
          </Link>
        </Card>
      </section>
    </main>
  );
}
