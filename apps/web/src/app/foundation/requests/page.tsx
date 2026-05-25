import { prisma } from "@al-infaaq/db";
import { Badge } from "@al-infaaq/ui/badge";
import { Button } from "@al-infaaq/ui/button";
import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import Link from "next/link";
import { requireRole } from "@/lib/server-auth";
import { createDonationRequest, publishDonationRequest } from "./actions";

export default async function FoundationRequestsPage() {
  const session = await requireRole(["foundation", "admin"]);
  const foundation = await prisma.foundation.findFirst({
    where:
      session.user.role === "admin"
        ? undefined
        : {
            userId: session.user.id,
          },
  });

  const requests = foundation
    ? await prisma.donationRequest.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          foundationId: foundation.id,
        },
      })
    : [];

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

        {canCreate ? (
          <form action={createDonationRequest}>
            <Card className="grid gap-5 p-5">
              <h2 className="text-xl font-semibold">Create request</h2>
              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Title
                <input
                  className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
                  name="title"
                  required
                  type="text"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Story
                <textarea
                  className="min-h-28 rounded-md border border-stone-300 px-3 py-3 text-base outline-none focus:border-emerald-700"
                  name="story"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Target amount in NGN
                <input
                  className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
                  min="1"
                  name="targetNaira"
                  required
                  step="1"
                  type="number"
                />
              </label>
              <div className="flex justify-end">
                <Button type="submit">Create draft</Button>
              </div>
            </Card>
          </form>
        ) : null}

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
                </div>
                <div className="flex flex-wrap gap-2">
                  {request.status === "DRAFT" ? (
                    <form action={publishDonationRequest}>
                      <input
                        name="requestId"
                        type="hidden"
                        value={request.id}
                      />
                      <Button type="submit">Publish</Button>
                    </form>
                  ) : (
                    <>
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
