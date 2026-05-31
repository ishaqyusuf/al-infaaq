import { Card } from "@al-infaaq/ui/card";
import { PublicRequestsDataTable } from "@/components/tables/public-requests/data-table";
import { createServerTrpcCaller } from "@/lib/trpc-server";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const trpc = await createServerTrpcCaller();
  const requests = await trpc.requests.publicList();

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <section className="mx-auto grid max-w-6xl gap-5">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-500">
            Public requests
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Foundation spending needs
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-400">
            Browse approved foundation requests. Donation totals are aggregate;
            spender identities stay private.
          </p>
        </Card>

        <PublicRequestsDataTable requests={requests} />
      </section>
    </main>
  );
}
