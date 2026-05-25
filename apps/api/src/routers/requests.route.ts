import { prisma } from "@al-infaaq/db";
import { nairaToKobo, resolveAppUrl } from "@al-infaaq/utils";
import { TRPCError } from "@trpc/server";
import QRCode from "qrcode";
import { z } from "zod";

import {
  createTRPCRouter,
  permissionProcedure,
  publicProcedure,
} from "../lib.trpc";

const createRequestInputSchema = z.object({
  story: z.string().trim().min(1),
  targetNaira: z.number().positive(),
  title: z.string().trim().min(1),
});

const requestIdInputSchema = z.object({
  requestId: z.string().min(1),
});

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

function requestOrigin(headers: Headers) {
  const origin = headers.get("origin");

  if (origin) {
    return origin;
  }

  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const protocol = headers.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : undefined;
}

export const requestsRouter = createTRPCRouter({
  bannerPreview: permissionProcedure("requests:create")
    .input(requestIdInputSchema)
    .query(async ({ ctx, input }) => {
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
          id: input.requestId,
        },
      });

      if (!request) {
        return null;
      }

      if (
        ctx.auth.session.user.role !== "admin" &&
        request.foundation.userId !== ctx.auth.session.user.id
      ) {
        return null;
      }

      return request;
    }),
  foundationWorkspace: permissionProcedure("requests:create").query(
    async ({ ctx }) => {
      const foundation = await prisma.foundation.findFirst({
        where:
          ctx.auth.session.user.role === "admin"
            ? undefined
            : {
                userId: ctx.auth.session.user.id,
              },
      });

      const requests = foundation
        ? await prisma.donationRequest.findMany({
            include: {
              _count: {
                select: {
                  banners: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            where: {
              foundationId: foundation.id,
            },
          })
        : [];
      const donationGroups =
        foundation && requests.length > 0
          ? await prisma.donation.groupBy({
              _count: { _all: true },
              _sum: { amountKobo: true },
              by: ["donationRequestId", "status"],
              where: {
                donationRequestId: {
                  in: requests.map((request) => request.id),
                },
                foundationId: foundation.id,
              },
            })
          : [];
      const requestsWithReports = requests.map((request) => {
        const groups = donationGroups.filter(
          (group) => group.donationRequestId === request.id,
        );
        const statusCounts = {
          FAILED: 0,
          PENDING: 0,
          REFUNDED: 0,
          SUCCEEDED: 0,
        };
        const succeededGroup = groups.find(
          (group) => group.status === "SUCCEEDED",
        );

        for (const group of groups) {
          statusCounts[group.status] = group._count._all;
        }

        return {
          ...request,
          report: {
            bannerCount: request._count.banners,
            progressPercent:
              request.targetKobo > 0
                ? Math.min(100, (request.raisedKobo / request.targetKobo) * 100)
                : 0,
            remainingKobo: Math.max(0, request.targetKobo - request.raisedKobo),
            statusCounts,
            succeededKobo: succeededGroup?._sum.amountKobo ?? 0,
          },
        };
      });

      return {
        foundation,
        requests: requestsWithReports,
      };
    },
  ),
  publicDetail: publicProcedure
    .input(requestIdInputSchema)
    .query(({ input }) => {
      return prisma.donationRequest.findFirst({
        include: {
          foundation: true,
        },
        where: {
          foundation: {
            status: "APPROVED",
          },
          id: input.requestId,
          status: {
            in: ["PUBLISHED", "FUNDED"],
          },
        },
      });
    }),
  publicList: publicProcedure.query(() => {
    return prisma.donationRequest.findMany({
      include: {
        foundation: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      where: {
        foundation: {
          status: "APPROVED",
        },
        status: {
          in: ["PUBLISHED", "FUNDED"],
        },
      },
    });
  }),
  create: permissionProcedure("requests:create")
    .input(createRequestInputSchema)
    .mutation(async ({ ctx, input }) => {
      const foundation = await prisma.foundation.findFirst({
        where:
          ctx.auth.session.user.role === "admin"
            ? { status: "APPROVED" }
            : { status: "APPROVED", userId: ctx.auth.session.user.id },
      });

      if (!foundation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "An approved foundation is required to create requests.",
        });
      }

      const request = await prisma.donationRequest.create({
        data: {
          foundationId: foundation.id,
          story: input.story,
          targetKobo: nairaToKobo(input.targetNaira),
          title: input.title,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "donation_request.created",
          actorId: ctx.auth.session.user.id,
          target: request.id,
        },
      });

      return request;
    }),
  generateBanner: permissionProcedure("requests:create")
    .input(requestIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const donationRequest = await prisma.donationRequest.findUnique({
        include: {
          foundation: true,
        },
        where: {
          id: input.requestId,
        },
      });

      if (!donationRequest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Request not found.",
        });
      }

      if (
        ctx.auth.session.user.role !== "admin" &&
        donationRequest.foundation.userId !== ctx.auth.session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only generate banners for your own requests.",
        });
      }

      if (donationRequest.foundation.status !== "APPROVED") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only approved foundations can generate banners.",
        });
      }

      if (donationRequest.status !== "PUBLISHED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only published requests can generate banners.",
        });
      }

      const appUrl = resolveAppUrl({
        fallbackOrigin: requestOrigin(ctx.headers),
      });
      const requestUrl = new URL(
        `/requests/${donationRequest.id}`,
        appUrl,
      ).toString();
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
  <text x="846" y="432" fill="#57534e" font-family="Arial, sans-serif" font-size="22">alinfaaq request</text>
</svg>`.trim();
      const imageUrl = svgDataUrl(svg);
      const banner = await prisma.fundraisingBanner.create({
        data: {
          donationRequestId: donationRequest.id,
          imageUrl,
          qrCodeUrl: qrCodeDataUrl,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "donation_request.banner_generated",
          actorId: ctx.auth.session.user.id,
          target: donationRequest.id,
        },
      });

      return {
        banner,
        height: 630,
        requestUrl,
        width: 1200,
      };
    }),
  publish: permissionProcedure("requests:publish")
    .input(requestIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const request = await prisma.donationRequest.findUnique({
        include: {
          foundation: true,
        },
        where: {
          id: input.requestId,
        },
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Request not found.",
        });
      }

      if (
        ctx.auth.session.user.role !== "admin" &&
        request.foundation.userId !== ctx.auth.session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only publish your own foundation requests.",
        });
      }

      if (request.foundation.status !== "APPROVED") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only approved foundations can publish requests.",
        });
      }

      if (request.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft requests can be published.",
        });
      }

      const updatedRequest = await prisma.donationRequest.update({
        data: {
          publishedAt: new Date(),
          status: "PUBLISHED",
        },
        where: {
          id: input.requestId,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "donation_request.published",
          actorId: ctx.auth.session.user.id,
          target: input.requestId,
        },
      });

      return updatedRequest;
    }),
  archive: permissionProcedure("requests:publish")
    .input(requestIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const request = await prisma.donationRequest.findUnique({
        include: {
          foundation: true,
        },
        where: {
          id: input.requestId,
        },
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Request not found.",
        });
      }

      if (
        ctx.auth.session.user.role !== "admin" &&
        request.foundation.userId !== ctx.auth.session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only archive your own foundation requests.",
        });
      }

      if (request.status === "ARCHIVED") {
        return request;
      }

      const updatedRequest = await prisma.donationRequest.update({
        data: {
          status: "ARCHIVED",
        },
        where: {
          id: input.requestId,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "donation_request.archived",
          actorId: ctx.auth.session.user.id,
          target: input.requestId,
        },
      });

      return updatedRequest;
    }),
});
