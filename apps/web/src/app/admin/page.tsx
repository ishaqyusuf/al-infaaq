import { prisma } from "@al-infaaq/db";
import { Badge } from "@al-infaaq/ui/badge";
import { Button } from "@al-infaaq/ui/button";
import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import { requireRole } from "@/lib/server-auth";
import { restoreFoundation, suspendFoundation } from "./actions";

export default async function AdminPage() {
  await requireRole(["admin"]);

  const [users, foundations, requests, donations, auditLogs] =
    await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.foundation.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.donationRequest.findMany({
        include: { foundation: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.donation.findMany({
        include: { foundation: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.auditLog.findMany({
        include: { actor: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  const totalSucceededKobo = donations
    .filter((donation) => donation.status === "SUCCEEDED")
    .reduce((total, donation) => total + donation.amountKobo, 0);

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
        </div>

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
                    <Badge className="bg-stone-100 text-stone-900">
                      {foundation.status}
                    </Badge>
                  </div>
                  <form className="mt-3" action={suspendFoundation}>
                    <input
                      name="foundationId"
                      type="hidden"
                      value={foundation.id}
                    />
                    {foundation.status === "SUSPENDED" ? (
                      <Button formAction={restoreFoundation} type="submit">
                        Restore
                      </Button>
                    ) : (
                      <Button type="submit" variant="outline">
                        Suspend
                      </Button>
                    )}
                  </form>
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
                    <Badge className="bg-stone-100 text-stone-900">
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
                    <Badge className="bg-stone-100 text-stone-900">
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
