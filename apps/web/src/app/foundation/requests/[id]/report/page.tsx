import { Badge } from "@al-infaaq/ui/badge";
import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import { notFound } from "next/navigation";
import { FoundationRequestStatusBadge } from "@/components/tables/foundation-requests/columns";
import { requireRole } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";

export const dynamic = "force-dynamic";

export default async function RequestImpactReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["foundation", "admin"]);
  const { id } = await params;
  const trpc = await createServerTrpcCaller();
  const report = await trpc.requests.impactReport({ requestId: id });

  if (!report) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <section className="mx-auto grid max-w-5xl gap-5">
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-900">
              Privacy-safe impact report
            </Badge>
            <FoundationRequestStatusBadge status={report.request.status} />
          </div>
          <h1 className="mt-4 text-3xl font-semibold">
            {report.request.title}
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            {report.foundation.name}
          </p>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-stone-700 dark:text-stone-300">
            This report summarizes request performance with aggregate donation
            totals only. It is safe for foundation operations because donor
            names, emails, account IDs, and provider customer identifiers are
            not included.
          </p>
        </Card>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric
            label="Raised"
            value={formatNaira(report.request.raisedKobo / 100)}
          />
          <Metric
            label="Target"
            value={formatNaira(report.request.targetKobo / 100)}
          />
          <Metric
            label="Remaining"
            value={formatNaira(report.remainingKobo / 100)}
          />
          <Metric label="Banners" value={String(report.bannerCount)} />
        </section>

        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Funding progress</h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                {Math.round(report.progressPercent)}% of this request has been
                funded by successful donations.
              </p>
            </div>
            <Badge className="bg-stone-100 dark:bg-stone-900 text-stone-900">
              {report.successfulDonationCount} completed gifts
            </Badge>
          </div>
          <div className="mt-5 h-2 rounded-full bg-stone-200 dark:bg-stone-800">
            <div
              className="h-2 rounded-full bg-emerald-600"
              style={{ width: `${report.progressPercent}%` }}
            />
          </div>
        </Card>

        <section className="grid gap-5 md:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-xl font-semibold">Donation status mix</h2>
            <div className="mt-4 grid gap-3">
              <StatusRow
                amountKobo={report.statusTotalsKobo.SUCCEEDED}
                count={report.statusCounts.SUCCEEDED}
                label="Succeeded"
              />
              <StatusRow
                amountKobo={report.statusTotalsKobo.PENDING}
                count={report.statusCounts.PENDING}
                label="Pending"
              />
              <StatusRow
                amountKobo={report.statusTotalsKobo.FAILED}
                count={report.statusCounts.FAILED}
                label="Failed"
              />
              <StatusRow
                amountKobo={report.statusTotalsKobo.REFUNDED}
                count={report.statusCounts.REFUNDED}
                label="Refunded"
              />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-semibold">Operational notes</h2>
            <div className="mt-4 grid gap-3 text-sm text-stone-600 dark:text-stone-400">
              <p>
                Published and funded requests can be shared publicly with QR
                banners while keeping donors anonymous to the foundation.
              </p>
              <p>
                Pending and failed payments belong in admin reconciliation, not
                public impact claims.
              </p>
              <p>
                Successful totals are the source of truth for request progress,
                wallet history, payout readiness, and funded-state transitions.
              </p>
            </div>
          </Card>
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

function StatusRow({
  amountKobo,
  count,
  label,
}: {
  amountKobo: number;
  count: number;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 dark:border-stone-800 p-3">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-500">
          {count} records
        </p>
      </div>
      <p className="font-semibold">{formatNaira(amountKobo / 100)}</p>
    </div>
  );
}
