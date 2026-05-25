import { Card } from "@al-infaaq/ui/card";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";
import { BannerGenerateButton } from "./banner-generate-button";

export const dynamic = "force-dynamic";

export default async function BannerPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["foundation", "admin"]);
  const { id } = await params;
  const trpc = await createServerTrpcCaller();
  const request = await trpc.requests.bannerPreview({ requestId: id });

  if (!request) {
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
            Generate a QR-backed banner, preview the latest generated asset, and
            use the download link for sharing.
          </p>
          <BannerGenerateButton requestId={request.id} />
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
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-semibold"
                download={`alinfaaq-${request.id}-banner.svg`}
                href={`/api/requests/${request.id}/banner`}
              >
                Download banner
              </a>
              <a
                className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-semibold"
                href={`/requests/${request.id}`}
              >
                Open request
              </a>
            </div>
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
