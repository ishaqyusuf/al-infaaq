import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";
import { DonationForm } from "./donation-form";

export const dynamic = "force-dynamic";

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  await requireRole(["spender", "admin"]);
  const { requestId } = await searchParams;

  if (!requestId) {
    notFound();
  }

  const trpc = await createServerTrpcCaller();
  const request = await trpc.requests.publicDetail({ requestId });

  if (!request) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-stone-950 sm:px-8">
      <section className="mx-auto grid max-w-2xl gap-5">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500">
            Anonymous donation
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{request.title}</h1>
          <p className="mt-2 text-sm text-stone-600">
            {request.foundation.name}
          </p>
          <p className="mt-5 text-sm text-stone-700">
            {formatNaira(request.raisedKobo / 100)} raised of{" "}
            {formatNaira(request.targetKobo / 100)}
          </p>
        </Card>

        <DonationForm requestId={request.id} />
      </section>
    </main>
  );
}
