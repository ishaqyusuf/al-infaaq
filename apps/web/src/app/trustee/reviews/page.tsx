import { Card } from "@al-infaaq/ui/card";
import { TrusteeReviewsDataTable } from "@/components/tables/trustee-reviews/data-table";
import { requireRole } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";

export const dynamic = "force-dynamic";

export default async function TrusteeReviewsPage() {
  await requireRole(["trustee", "admin"]);
  const trpc = await createServerTrpcCaller();
  const reviews = await trpc.trustee.reviews();

  return (
    <main className="min-h-screen bg-[#f7f5ef] dark:bg-[#11100d] px-5 py-8 text-stone-950 dark:text-stone-50 sm:px-8">
      <section className="mx-auto grid max-w-5xl gap-5">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-500">
            Trustee reviews
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Foundation queue</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-400">
            Review foundation profiles before they can collect public donations.
            Trustees approve legitimacy; they do not manage foundation funds.
          </p>
        </Card>

        <TrusteeReviewsDataTable reviews={reviews} />
      </section>
    </main>
  );
}
