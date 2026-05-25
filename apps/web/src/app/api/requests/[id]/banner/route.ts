import { prisma } from "@al-infaaq/db";
import { NextResponse } from "next/server";

function decodeSvgDataUrl(dataUrl: string) {
  const prefix = "data:image/svg+xml;base64,";

  if (!dataUrl.startsWith(prefix)) {
    return null;
  }

  return Buffer.from(dataUrl.slice(prefix.length), "base64").toString("utf8");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const donationRequest = await prisma.donationRequest.findFirst({
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
      foundation: {
        status: "APPROVED",
      },
      id,
      status: {
        in: ["PUBLISHED", "FUNDED"],
      },
    },
  });
  const latestBanner = donationRequest?.banners[0] ?? null;
  const svg = latestBanner?.imageUrl
    ? decodeSvgDataUrl(latestBanner.imageUrl)
    : null;

  if (!svg) {
    return NextResponse.json(
      { error: "Generated banner not found." },
      { status: 404 },
    );
  }

  return new NextResponse(svg, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Disposition": `inline; filename="alinfaaq-${id}-banner.svg"`,
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
  });
}
