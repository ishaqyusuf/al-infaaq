import { Badge } from "@al-infaaq/ui/badge";
import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import { requireRole } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";
import { FoundationStatusButton } from "./foundation-status-button";

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
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-stone-950 sm:px-8">
      <section className="mx-auto grid max-w-7xl gap-5">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Operations dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
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
                <p className="mt-1 text-sm text-stone-600">
                  Pending, failed, and refunded donations that need operational
                  awareness.
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-900">
                {reconciliationItems.length} open
              </Badge>
            </div>
            <div className="mt-4 grid gap-3">
              {reconciliationItems.length === 0 ? (
                <p className="rounded-lg border border-stone-200 p-3 text-sm text-stone-600">
                  No payment exceptions are waiting for review.
                </p>
              ) : (
                reconciliationItems.map((donation) => (
                  <div
                    className="rounded-lg border border-stone-200 p-3"
                    key={donation.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {formatNaira(donation.amountKobo / 100)}
                        </p>
                        <p className="text-sm text-stone-600">
                          {donation.foundation.name}
                        </p>
                        {donation.donationRequest ? (
                          <p className="mt-1 text-sm text-stone-500">
                            {donation.donationRequest.title}
                          </p>
                        ) : null}
                      </div>
                      <Badge className={statusBadgeClass(donation.status)}>
                        {donation.status}
                      </Badge>
                    </div>
                    <p className="mt-2 break-all text-xs text-stone-500">
                      {donation.provider}: {donation.providerReference}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      Updated {donation.updatedAt.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
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
          <Card className="p-5">
            <h2 className="text-xl font-semibold">Foundations</h2>
            <div className="mt-4 grid gap-3">
              {foundations.map((foundation) => (
                <div
                  className="rounded-lg border border-stone-200 p-3"
                  key={foundation.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{foundation.name}</p>
                      <p className="text-sm text-stone-600">
                        {foundation.user.email}
                      </p>
                    </div>
                    <Badge className={statusBadgeClass(foundation.status)}>
                      {foundation.status}
                    </Badge>
                  </div>
                  <FoundationStatusButton
                    foundationId={foundation.id}
                    isSuspended={foundation.status === "SUSPENDED"}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-semibold">Donation Requests</h2>
            <div className="mt-4 grid gap-3">
              {requests.map((request) => (
                <div
                  className="rounded-lg border border-stone-200 p-3"
                  key={request.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{request.title}</p>
                      <p className="text-sm text-stone-600">
                        {request.foundation.name}
                      </p>
                    </div>
                    <Badge className={statusBadgeClass(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-stone-700">
                    {formatNaira(request.raisedKobo / 100)} of{" "}
                    {formatNaira(request.targetKobo / 100)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-xl font-semibold">Donations</h2>
            <div className="mt-4 grid gap-3">
              {donations.map((donation) => (
                <div
                  className="rounded-lg border border-stone-200 p-3"
                  key={donation.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {formatNaira(donation.amountKobo / 100)}
                      </p>
                      <p className="text-sm text-stone-600">
                        {donation.foundation.name}
                      </p>
                    </div>
                    <Badge className={statusBadgeClass(donation.status)}>
                      {donation.status}
                    </Badge>
                  </div>
                  <p className="mt-2 break-all text-xs text-stone-500">
                    {donation.provider}: {donation.providerReference}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-semibold">Audit Log</h2>
            <div className="mt-4 grid gap-3">
              {auditLogs.map((log) => (
                <div
                  className="rounded-lg border border-stone-200 p-3"
                  key={log.id}
                >
                  <p className="font-semibold">{log.action}</p>
                  <p className="mt-1 break-all text-xs text-stone-500">
                    {log.target}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    {log.actor?.email ?? "System"} ·{" "}
                    {log.createdAt.toLocaleString()}
                  </p>
                </div>
              ))}
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
      <p className="text-sm font-medium text-stone-500">{label}</p>
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
    <div className="rounded-lg border border-stone-200 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{label}</p>
        <Badge className="bg-stone-100 text-stone-900">{count} gifts</Badge>
      </div>
      <p className="mt-2 text-2xl font-semibold">
        {formatNaira(succeededKobo / 100)}
      </p>
    </div>
  );
}

function statusBadgeClass(status: string) {
  if (status === "APPROVED" || status === "FUNDED" || status === "SUCCEEDED") {
    return "bg-emerald-100 text-emerald-900";
  }

  if (status === "PENDING" || status === "PENDING_REVIEW") {
    return "bg-amber-100 text-amber-900";
  }

  if (status === "FAILED" || status === "REJECTED" || status === "SUSPENDED") {
    return "bg-rose-100 text-rose-900";
  }

  if (status === "REFUNDED" || status === "ARCHIVED") {
    return "bg-sky-100 text-sky-900";
  }

  return "bg-stone-100 text-stone-900";
}
