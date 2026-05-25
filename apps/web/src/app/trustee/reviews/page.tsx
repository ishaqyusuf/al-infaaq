import { Badge } from "@al-infaaq/ui/badge";
import { Card } from "@al-infaaq/ui/card";
import { requireRole } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";
import { ReviewDecisionForm } from "./review-decision-form";

export default async function TrusteeReviewsPage() {
  await requireRole(["trustee", "admin"]);
  const trpc = await createServerTrpcCaller();
  const reviews = await trpc.trustee.reviews();

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-stone-950 sm:px-8">
      <section className="mx-auto grid max-w-5xl gap-5">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500">Trustee reviews</p>
          <h1 className="mt-2 text-3xl font-semibold">Foundation queue</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Review foundation profiles before they can collect public donations.
            Trustees approve legitimacy; they do not manage foundation funds.
          </p>
        </Card>

        <div className="grid gap-4">
          {reviews.length === 0 ? (
            <Card className="p-5">
              <p className="text-sm text-stone-600">
                No foundation reviews are waiting.
              </p>
            </Card>
          ) : null}

          {reviews.map((review) => (
            <Card className="p-5" key={review.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">
                      {review.foundation.name}
                    </h2>
                    <Badge
                      className={
                        review.status === "PENDING"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-900"
                      }
                    >
                      {review.status}
                    </Badge>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
                    {review.foundation.description}
                  </p>
                  <dl className="mt-4 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-stone-500">Contact</dt>
                      <dd>
                        {review.foundation.contactEmail ?? "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-stone-500">
                        Registration
                      </dt>
                      <dd>
                        {review.foundation.registrationNumber ?? "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-stone-500">Website</dt>
                      <dd>{review.foundation.websiteUrl ?? "Not provided"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-stone-500">Document</dt>
                      <dd>{review.foundation.documentUrl ?? "Not provided"}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {review.status === "PENDING" ? (
                <div className="mt-5 grid gap-3 border-t border-stone-200 pt-5">
                  <ReviewDecisionForm reviewId={review.id} />
                </div>
              ) : (
                <p className="mt-5 border-t border-stone-200 pt-5 text-sm text-stone-600">
                  Decided by {review.trustee?.email ?? "a Trustee"}
                  {review.decidedAt
                    ? ` on ${review.decidedAt.toLocaleDateString()}`
                    : ""}
                  .
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
