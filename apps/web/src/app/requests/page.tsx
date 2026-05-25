import { Badge } from "@al-infaaq/ui/badge";
import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import Link from "next/link";
import { createServerTrpcCaller } from "@/lib/trpc-server";

export default async function RequestsPage() {
  const trpc = await createServerTrpcCaller();
  const requests = await trpc.requests.publicList();

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-stone-950 sm:px-8">
      <section className="mx-auto grid max-w-6xl gap-5">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500">Public requests</p>
          <h1 className="mt-2 text-3xl font-semibold">
            Foundation spending needs
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Browse approved foundation requests. Donation totals are aggregate;
            spender identities stay private.
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {requests.length === 0 ? (
            <Card className="p-5">
              <p className="text-sm text-stone-600">
                No public requests are published yet.
              </p>
            </Card>
          ) : null}

          {requests.map((request) => {
            const progress =
              request.targetKobo > 0
                ? Math.min(100, (request.raisedKobo / request.targetKobo) * 100)
                : 0;

            return (
              <Link href={`/requests/${request.id}`} key={request.id}>
                <Card className="h-full p-5 transition-colors hover:bg-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{request.title}</h2>
                    <Badge className="bg-emerald-100 text-emerald-900">
                      Approved foundation
                    </Badge>
                    {request.status === "FUNDED" ? (
                      <Badge className="bg-stone-950 text-white">Funded</Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-stone-600">
                    {request.foundation.name}
                  </p>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-600">
                    {request.story}
                  </p>
                  <div className="mt-5 h-2 rounded-full bg-stone-200">
                    <div
                      className="h-2 rounded-full bg-emerald-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-stone-700">
                    {formatNaira(request.raisedKobo / 100)} raised of{" "}
                    {formatNaira(request.targetKobo / 100)}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
