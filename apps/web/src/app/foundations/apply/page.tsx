import { prisma } from "@al-infaaq/db";
import { Badge } from "@al-infaaq/ui/badge";
import { Button } from "@al-infaaq/ui/button";
import { Card } from "@al-infaaq/ui/card";
import { redirect } from "next/navigation";
import { requireServerAuthSession } from "@/lib/server-auth";
import { submitFoundationForReview } from "./actions";

export default async function FoundationApplyPage() {
  const session = await requireServerAuthSession();

  if (session.user.role === "trustee") {
    redirect("/dashboard");
  }

  const foundation = await prisma.foundation.findUnique({
    where: {
      userId: session.user.id,
    },
  });

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

        <form action={submitFoundationForReview}>
          <Card className="grid gap-5 p-5">
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Foundation name
              <input
                className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
                defaultValue={foundation?.name ?? ""}
                name="name"
                required
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Description
              <textarea
                className="min-h-32 rounded-md border border-stone-300 px-3 py-3 text-base outline-none focus:border-emerald-700"
                defaultValue={foundation?.description ?? ""}
                name="description"
                required
              />
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Contact email
                <input
                  className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
                  defaultValue={foundation?.contactEmail ?? session.user.email}
                  name="contactEmail"
                  type="email"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Registration number
                <input
                  className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
                  defaultValue={foundation?.registrationNumber ?? ""}
                  name="registrationNumber"
                  type="text"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Website URL
                <input
                  className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
                  defaultValue={foundation?.websiteUrl ?? ""}
                  name="websiteUrl"
                  type="url"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Document URL
                <input
                  className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
                  defaultValue={foundation?.documentUrl ?? ""}
                  name="documentUrl"
                  type="url"
                />
              </label>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Submit for Trustee review</Button>
            </div>
          </Card>
        </form>
      </section>
    </main>
  );
}
