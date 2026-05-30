import { Badge } from "@al-infaaq/ui/badge";
import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import { AdminAuditLogsDataTable } from "@/components/tables/admin-audit-logs/data-table";
import { AdminDonationsDataTable } from "@/components/tables/admin-donations/data-table";
import { AdminFoundationsDataTable } from "@/components/tables/admin-foundations/data-table";
import { AdminRequestsDataTable } from "@/components/tables/admin-requests/data-table";
import { requireRole } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireRole(["admin"]);
  const trpc = await createServerTrpcCaller();
  const {
    auditLogs,
    donations,
    donationStatusCounts,
    foundations,
    providerTotals,
    reconciliationItems,
    requests,
    totalSucceededKobo,
    users,
  } = await trpc.admin.dashboard();

  return (
    <main className="min-h-screen bg-[#f7f5ef] dark:bg-[#11100d] px-5 py-8 text-stone-950 dark:text-stone-50 sm:px-8">
      <section className="mx-auto grid max-w-7xl gap-5">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-500">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Operations dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-400">
            Review platform operations, suspend risky foundations, and inspect
            payment/request activity without direct database access.
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Users" value={String(users.length)} />
          <Metric label="Foundations" value={String(foundations.length)} />
          <Metric label="Requests" value={String(requests.length)} />
          <Metric
            label="Succeeded donations"
            value={formatNaira(totalSucceededKobo / 100)}
          />
          <Metric
            label="Pending donations"
            value={String(donationStatusCounts.PENDING)}
          />
          <Metric
            label="Failed donations"
            value={String(donationStatusCounts.FAILED)}
          />
          <Metric
            label="Refunded donations"
            value={String(donationStatusCounts.REFUNDED)}
          />
          <Metric
            label="Completed gifts"
            value={String(donationStatusCounts.SUCCEEDED)}
          />
        </div>

        <section className="grid gap-5 xl:grid-cols-3">
          <Card className="p-5 xl:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Reconciliation</h2>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                  Pending, failed, and refunded donations that need operational
                  awareness.
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-900">
                {reconciliationItems.length} open
              </Badge>
            </div>
            <div className="mt-4">
              <AdminDonationsDataTable
                donations={reconciliationItems}
                title="Reconciliation items"
              />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-semibold">Provider Totals</h2>
            <div className="mt-4 grid gap-3">
              <ProviderTotal
                count={providerTotals.PAYSTACK.count}
                label="Paystack"
                succeededKobo={providerTotals.PAYSTACK.succeededKobo}
              />
              <ProviderTotal
                count={providerTotals.LEMON_SQUEEZY.count}
                label="Lemon Squeezy"
                succeededKobo={providerTotals.LEMON_SQUEEZY.succeededKobo}
              />
            </div>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <AdminFoundationsDataTable foundations={foundations} />
          <AdminRequestsDataTable requests={requests} />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <AdminDonationsDataTable donations={donations} />
          <AdminAuditLogsDataTable auditLogs={auditLogs} />
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-stone-500 dark:text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Card>
  );
}

function ProviderTotal({
  count,
  label,
  succeededKobo,
}: {
  count: number;
  label: string;
  succeededKobo: number;
}) {
  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{label}</p>
        <Badge className="bg-stone-100 dark:bg-stone-900 text-stone-900">
          {count} gifts
        </Badge>
      </div>
      <p className="mt-2 text-2xl font-semibold">
        {formatNaira(succeededKobo / 100)}
      </p>
    </div>
  );
}
