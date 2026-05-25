import { Badge } from "@al-infaaq/ui/badge";
import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import Link from "next/link";
import { requireRole } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";
import { CreateRequestForm, RequestMutationButton } from "./request-forms";

export default async function FoundationRequestsPage() {
  await requireRole(["foundation", "admin"]);
  const trpc = await createServerTrpcCaller();
  const { foundation, requests } = await trpc.requests.foundationWorkspace();

  const canCreate = foundation?.status === "APPROVED";

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-stone-950 sm:px-8">
      <section className="mx-auto grid max-w-5xl gap-5">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500">
            Foundation requests
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Spending needs</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Approved foundations can draft and publish public requests. Public
            pages show request progress and foundation identity, not spender
            identities.
          </p>
        </Card>

        {!foundation ? (
          <Card className="p-5">
            <p className="text-sm text-stone-600">
              Complete foundation onboarding before creating requests.
            </p>
            <Link
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-semibold text-white"
              href="/foundations/apply"
            >
              Start onboarding
            </Link>
          </Card>
        ) : null}

        {foundation && !canCreate ? (
          <Card className="p-5">
            <Badge className="bg-amber-100 text-amber-900">
              {foundation.status.replaceAll("_", " ")}
            </Badge>
            <p className="mt-3 text-sm text-stone-600">
              This foundation must be approved by a Trustee before publishing
              public requests.
            </p>
          </Card>
        ) : null}

        {canCreate ? <CreateRequestForm /> : null}

        <div className="grid gap-4">
          {requests.map((request) => (
            <Card className="p-5" key={request.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{request.title}</h2>
                    <Badge className="bg-stone-100 text-stone-900">
                      {request.status}
                    </Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                    {request.story}
                  </p>
                  <p className="mt-4 text-sm text-stone-700">
                    {formatNaira(request.raisedKobo / 100)} raised of{" "}
                    {formatNaira(request.targetKobo / 100)}
                  </p>
                  <div className="mt-4 h-2 rounded-full bg-stone-200">
                    <div
                      className="h-2 rounded-full bg-emerald-600"
                      style={{ width: `${request.report.progressPercent}%` }}
                    />
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                    <RequestMetric
                      label="Remaining"
                      value={formatNaira(request.report.remainingKobo / 100)}
                    />
                    <RequestMetric
                      label="Completed gifts"
                      value={String(request.report.statusCounts.SUCCEEDED)}
                    />
                    <RequestMetric
                      label="Pending"
                      value={String(request.report.statusCounts.PENDING)}
                    />
                    <RequestMetric
                      label="Banners"
                      value={String(request.report.bannerCount)}
                    />
                  </dl>
                </div>
                <div className="flex flex-wrap gap-2">
                  {request.status === "DRAFT" ? (
                    <RequestMutationButton
                      requestId={request.id}
                      variant="publish"
                    >
                      Publish
                    </RequestMutationButton>
                  ) : (
                    <>
                      {request.status !== "ARCHIVED" ? (
                        <RequestMutationButton
                          requestId={request.id}
                          variant="archive"
                        >
                          Archive
                        </RequestMutationButton>
                      ) : null}
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-semibold"
                        href={`/foundation/requests/${request.id}/banner`}
                      >
                        Banner
                      </Link>
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-semibold text-white"
                        href={`/requests/${request.id}`}
                      >
                        View public page
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function RequestMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 p-3">
      <dt className="text-xs font-medium text-stone-500">{label}</dt>
      <dd className="mt-1 font-semibold text-stone-900">{value}</dd>
    </div>
  );
}
