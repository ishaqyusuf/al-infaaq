import { Badge } from "@al-infaaq/ui/badge";
import { Card } from "@al-infaaq/ui/card";
import { requireRole } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";
import { FoundationReviewForm } from "./foundation-review-form";

export const dynamic = "force-dynamic";

export default async function FoundationApplyPage() {
  const session = await requireRole(["spender", "foundation"]);
  const trpc = await createServerTrpcCaller();
  const foundation = await trpc.foundations.current();

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-stone-950 sm:px-8">
      <section className="mx-auto grid max-w-4xl gap-5">
        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-stone-500">
                Foundation onboarding
              </p>
              <h1 className="mt-2 text-3xl font-semibold">
                Trustee review submission
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                Submit a foundation profile for Trustee review. Approved
                foundations can publish public donation requests.
              </p>
            </div>
            {foundation ? (
              <Badge className="bg-emerald-100 text-emerald-900">
                {foundation.status.replaceAll("_", " ")}
              </Badge>
            ) : null}
          </div>
        </Card>

        <FoundationReviewForm
          defaultValues={{
            contactEmail: foundation?.contactEmail ?? session.user.email,
            description: foundation?.description,
            documentUrl: foundation?.documentUrl,
            name: foundation?.name,
            registrationNumber: foundation?.registrationNumber,
            websiteUrl: foundation?.websiteUrl,
          }}
        />
      </section>
    </main>
  );
}
