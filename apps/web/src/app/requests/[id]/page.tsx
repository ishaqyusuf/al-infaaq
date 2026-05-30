import { Badge } from "@al-infaaq/ui/badge";
import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerTrpcCaller } from "@/lib/trpc-server";

export const dynamic = "force-dynamic";

export default async function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trpc = await createServerTrpcCaller();
  const request = await trpc.requests.publicDetail({ requestId: id });

  if (!request) {
    notFound();
  }

  const progress =
    request.targetKobo > 0
      ? Math.min(100, (request.raisedKobo / request.targetKobo) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-[#f7f5ef] dark:bg-[#11100d] px-5 py-8 text-stone-950 dark:text-stone-50 sm:px-8">
      <section className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.7fr_0.3fr]">
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-900">
              Trustee-reviewed foundation
            </Badge>
            <Badge className="bg-stone-100 dark:bg-stone-900 text-stone-900">
              Anonymous giving
            </Badge>
            {request.status === "FUNDED" ? (
              <Badge className="bg-stone-950 text-white">Funded</Badge>
            ) : null}
          </div>
          <h1 className="mt-5 text-4xl font-semibold">{request.title}</h1>
          <p className="mt-3 text-sm font-medium text-stone-600 dark:text-stone-400">
            {request.foundation.name}
          </p>
          <p className="mt-6 text-base leading-7 text-stone-700 dark:text-stone-300">
            {request.story}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-500">
                Raised
              </p>
              <p className="mt-1 text-3xl font-semibold">
                {formatNaira(request.raisedKobo / 100)}
              </p>
            </div>
            <ShieldCheck
              aria-hidden="true"
              className="size-7 text-emerald-700"
            />
          </div>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
            of {formatNaira(request.targetKobo / 100)}
          </p>
          <div className="mt-5 h-2 rounded-full bg-stone-200">
            <div
              className="h-2 rounded-full bg-emerald-600"
              style={{ width: `${progress}%` }}
            />
          </div>
          {request.status === "PUBLISHED" ? (
            <Link
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white"
              href={`/donate?requestId=${request.id}`}
            >
              Donate anonymously
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : (
            <p className="mt-6 rounded-md bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-900">
              This request has reached its funding goal.
            </p>
          )}
          <p className="mt-4 text-xs leading-5 text-stone-500 dark:text-stone-500">
            Foundations see aggregate totals, not spender names, emails, or
            account identifiers.
          </p>
        </Card>
      </section>
    </main>
  );
}
