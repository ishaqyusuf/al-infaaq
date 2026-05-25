import { prisma } from "@al-infaaq/db";
import { resolveAppUrl } from "@al-infaaq/utils";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

function escapeSvgText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const donationRequest = await prisma.donationRequest.findFirst({
    include: {
      foundation: true,
    },
    where: {
      foundation: {
        status: "APPROVED",
      },
      id,
      status: "PUBLISHED",
    },
  });

  if (!donationRequest) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  const appUrl = resolveAppUrl({ fallbackOrigin: new URL(request.url).origin });
  const requestUrl = new URL(`/requests/${id}`, appUrl).toString();
  const qrCodeDataUrl = await QRCode.toDataURL(requestUrl, {
    color: {
      dark: "#17130d",
      light: "#ffffff",
    },
    margin: 1,
    scale: 8,
  });
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f5ef"/>
  <rect x="54" y="54" width="1092" height="522" rx="18" fill="#ffffff" stroke="#d6d3ca" stroke-width="2"/>
  <text x="96" y="132" fill="#17130d" font-family="Arial, sans-serif" font-size="34" font-weight="700">Al-Infaaq</text>
  <text x="96" y="182" fill="#57534e" font-family="Arial, sans-serif" font-size="24">Trustee-reviewed foundation request</text>
  <text x="96" y="278" fill="#17130d" font-family="Arial, sans-serif" font-size="56" font-weight="700">${escapeSvgText(donationRequest.title)}</text>
  <text x="96" y="336" fill="#57534e" font-family="Arial, sans-serif" font-size="30">${escapeSvgText(donationRequest.foundation.name)}</text>
  <text x="96" y="466" fill="#17130d" font-family="Arial, sans-serif" font-size="32" font-weight="700">Scan to give anonymously</text>
  <image href="${qrCodeDataUrl}" x="846" y="160" width="232" height="232"/>
  <text x="846" y="432" fill="#57534e" font-family="Arial, sans-serif" font-size="22">al-infaaq request</text>
</svg>`.trim();
  const bannerImageUrl = svgDataUrl(svg);
  const banner = await prisma.fundraisingBanner.create({
    data: {
      donationRequestId: donationRequest.id,
      imageUrl: bannerImageUrl,
      qrCodeUrl: qrCodeDataUrl,
    },
  });

  return NextResponse.json({
    banner: {
      id: banner.id,
      height: 630,
      imageUrl: bannerImageUrl,
      status: "ready",
      width: 1200,
    },
    qrCodeDataUrl,
    requestId: id,
    requestUrl,
  });
}
