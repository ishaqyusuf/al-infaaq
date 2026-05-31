import { Badge } from "@al-infaaq/ui/badge";
import { buttonVariants } from "@al-infaaq/ui/button";
import { Card } from "@al-infaaq/ui/card";
import Link from "next/link";
import { FoundationRequestsDataTable } from "@/components/tables/foundation-requests/data-table";
import { requireRole } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";
import { CreateRequestForm } from "./request-forms";

export const dynamic = "force-dynamic";

export default async function FoundationRequestsPage() {
  await requireRole(["foundation", "admin"]);
  const trpc = await createServerTrpcCaller();
  const { foundation, requests } = await trpc.requests.foundationWorkspace();

  const canCreate = foundation?.status === "APPROVED";

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <section className="mx-auto grid max-w-5xl gap-5">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-500">
            Foundation requests
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Spending needs</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-400">
            Approved foundations can draft and publish public requests. Public
            pages show request progress and foundation identity, not spender
            identities.
          </p>
        </Card>

        {!foundation ? (
          <Card className="p-5">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Complete foundation onboarding before creating requests.
            </p>
            <Link
              className={buttonVariants({ className: "mt-4" })}
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
            <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
              This foundation must be approved by a Trustee before publishing
              public requests.
            </p>
          </Card>
        ) : null}

        {canCreate ? <CreateRequestForm /> : null}

        <FoundationRequestsDataTable requests={requests} />
      </section>
    </main>
  );
}
