import { verifyPaystackTransaction } from "@al-infaaq/payments";
import { buttonVariants } from "@al-infaaq/ui/button";
import { Card } from "@al-infaaq/ui/card";
import Link from "next/link";
import { markDonationSucceeded } from "@/app/api/payments/_shared";

export default async function DonationCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  let status = "We could not find a payment reference.";

  if (reference) {
    const verification = await verifyPaystackTransaction(reference);
    const isSuccessful =
      verification?.data?.status === "success" ||
      verification?.data?.gateway_response === "Successful";

    if (isSuccessful) {
      await markDonationSucceeded(reference);
      status = "Donation recorded successfully.";
    } else {
      status = "Payment is not marked successful yet.";
    }
  }

  return (
    <main className="grid min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <section className="mx-auto grid w-full max-w-md content-center">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-500">
            Donation complete
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{status}</h1>
          <Link
            className={buttonVariants({ className: "mt-6" })}
            href="/requests"
          >
            Browse requests
          </Link>
        </Card>
      </section>
    </main>
  );
}
