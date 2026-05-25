import { prisma } from "@al-infaaq/db";
import { Card } from "@al-infaaq/ui/card";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/server-auth";

export default async function BannerPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["foundation", "admin"]);
  const { id } = await params;
  const request = await prisma.donationRequest.findUnique({
    include: {
      banners: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      foundation: true,
    },
    where: {
      id,
    },
  });

  if (!request) {
    notFound();
  }

  if (
    session.user.role !== "admin" &&
    request.foundation.userId !== session.user.id
  ) {
    notFound();
  }

  const latestBanner = request.banners[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-stone-950 sm:px-8">
      <section className="mx-auto grid max-w-5xl gap-5">
        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500">
            Fundraising banner
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{request.title}</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Generate a QR-backed banner from the API route, then preview the
            latest generated asset here.
          </p>
          <a
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-semibold text-white"
            href={`/api/requests/${request.id}/banner`}
          >
            Generate banner
          </a>
        </Card>

        {latestBanner?.imageUrl ? (
          <Card className="p-5">
            <Image
              alt={`Fundraising banner for ${request.title}`}
              className="h-auto w-full rounded-lg border border-stone-200"
              height={630}
              src={latestBanner.imageUrl}
              unoptimized
              width={1200}
            />
          </Card>
        ) : (
          <Card className="p-5">
            <p className="text-sm text-stone-600">
              No banner has been generated yet.
            </p>
          </Card>
        )}
      </section>
    </main>
  );
}
