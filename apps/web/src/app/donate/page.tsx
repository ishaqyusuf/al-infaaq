import { prisma } from "@al-infaaq/db";
import { Button } from "@al-infaaq/ui/button";
import { Card } from "@al-infaaq/ui/card";
import { formatNaira } from "@al-infaaq/utils";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/server-auth";
import { startDonation } from "./actions";

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

  const request = await prisma.donationRequest.findFirst({
    include: {
      foundation: true,
    },
    where: {
      foundation: {
        status: "APPROVED",
      },
      id: requestId,
      status: "PUBLISHED",
    },
  });

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

        <form action={startDonation}>
          <Card className="grid gap-5 p-5">
            <input name="requestId" type="hidden" value={request.id} />
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Amount in NGN
              <input
                className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
                min="1"
                name="amountNaira"
                required
                step="1"
                type="number"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Payment provider
              <select
                className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
                name="provider"
              >
                <option value="paystack">Paystack</option>
                <option value="lemon_squeezy">Lemon Squeezy</option>
              </select>
            </label>
            <Button type="submit">Continue to payment</Button>
            <p className="text-xs leading-5 text-stone-500">
              The foundation will see the donation amount and request progress,
              not your name, email, or account identifier.
            </p>
          </Card>
        </form>
      </section>
    </main>
  );
}
