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
    highValueDonations,
    highValueReviewThresholdKobo,
    incidentReviewItems,
    payoutReadiness,
    providerTotals,
    reconciliationItems,
    requests,
    stalePendingDonations,
    totalSucceededKobo,
    users,
  } = await trpc.admin.dashboard();

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
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

        <section className="grid gap-5 xl:grid-cols-3">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Payout readiness</h2>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                  Approved foundations with successful gifts and no open payment
                  exceptions.
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-900">
                {payoutReadiness.filter((item) => item.ready).length} ready
              </Badge>
            </div>
            <div className="mt-4 grid gap-3">
              {payoutReadiness.length > 0 ? (
                payoutReadiness
                  .slice(0, 5)
                  .map((item) => (
                    <PayoutReadinessItem
                      failedCount={item.failedCount}
                      key={item.foundation.id}
                      name={item.foundation.name}
                      pendingCount={item.pendingCount}
                      ready={item.ready}
                      succeededKobo={item.succeededKobo}
                    />
                  ))
              ) : (
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  No approved foundation has successful donations yet.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5 xl:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Trust operations</h2>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                  Stale pending payments and high-value successful donations for
                  operational review.
                </p>
              </div>
              <Badge className="bg-amber-100 text-amber-900">
                {stalePendingDonations.length + highValueDonations.length}{" "}
                review
              </Badge>
            </div>
            <div className="mt-4 grid gap-4">
              <AdminDonationsDataTable
                donations={stalePendingDonations}
                title="Stale pending donations"
              />
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-normal text-stone-500 dark:text-stone-500">
                  High value threshold:{" "}
                  {formatNaira(highValueReviewThresholdKobo / 100)}
                </p>
                <AdminDonationsDataTable
                  donations={highValueDonations}
                  title="High-value successful gifts"
                />
              </div>
            </div>
          </Card>
        </section>

        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Incident review</h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Support queue for suspended foundations, failed/refunded
                payments, stale pending payments, and high-value gifts.
              </p>
            </div>
            <Badge className="bg-red-100 text-red-900">
              {incidentReviewItems.length} open
            </Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {incidentReviewItems.length > 0 ? (
              incidentReviewItems.map((item) => (
                <IncidentReviewItem
                  key={item.id}
                  label={item.label}
                  reason={item.reason}
                  severity={item.severity}
                  target={item.target}
                  type={item.type}
                />
              ))
            ) : (
              <p className="text-sm text-stone-600 dark:text-stone-400">
                No incident review items are open.
              </p>
            )}
          </div>
        </Card>

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

function IncidentReviewItem({
  label,
  reason,
  severity,
  target,
  type,
}: {
  label: string;
  reason: string;
  severity: "high" | "low" | "medium";
  target: string;
  type: "FOUNDATION" | "PAYMENT";
}) {
  const severityClass =
    severity === "high"
      ? "bg-red-100 text-red-900"
      : severity === "medium"
        ? "bg-amber-100 text-amber-900"
        : "bg-stone-100 text-stone-900";

  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{label}</p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {reason}
          </p>
        </div>
        <Badge className={severityClass}>{severity}</Badge>
      </div>
      <p className="mt-3 text-xs text-stone-500 dark:text-stone-500">
        {type.toLowerCase()} - {target}
      </p>
    </div>
  );
}

function PayoutReadinessItem({
  failedCount,
  name,
  pendingCount,
  ready,
  succeededKobo,
}: {
  failedCount: number;
  name: string;
  pendingCount: number;
  ready: boolean;
  succeededKobo: number;
}) {
  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{name}</p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {formatNaira(succeededKobo / 100)} successful
          </p>
        </div>
        <Badge
          className={
            ready
              ? "bg-emerald-100 text-emerald-900"
              : "bg-amber-100 text-amber-900"
          }
        >
          {ready ? "ready" : "review"}
        </Badge>
      </div>
      <p className="mt-3 text-xs text-stone-500 dark:text-stone-500">
        {pendingCount} pending, {failedCount} failed
      </p>
    </div>
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
