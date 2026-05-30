import { prisma } from "@al-infaaq/db";

import { createTRPCRouter, protectedProcedure } from "../lib.trpc";

const roleNextSteps = {
  admin: {
    complete: true,
    href: "/admin",
    label: "Review platform operations",
    summary: "Manage users, foundations, requests, donations, and audit logs.",
  },
  trustee: {
    complete: true,
    href: "/trustee/reviews",
    label: "Open Trustee review queue",
    summary: "Approve or reject foundation review requests.",
  },
};

export const onboardingRouter = createTRPCRouter({
  nextStep: protectedProcedure.query(async ({ ctx }) => {
    const { role } = ctx.auth.session.user;

    if (role === "admin" || role === "trustee") {
      return roleNextSteps[role];
    }

    if (role === "foundation") {
      const foundation = await prisma.foundation.findUnique({
        select: {
          status: true,
        },
        where: {
          userId: ctx.auth.session.user.id,
        },
      });

      if (foundation?.status === "APPROVED") {
        return {
          complete: true,
          href: "/foundation/requests",
          label: "Manage foundation requests",
          summary: "Create, publish, and review aggregate request performance.",
        };
      }

      return {
        complete: false,
        href: "/foundations/apply",
        label: "Complete foundation onboarding",
        summary: "Submit or update your profile for Trustee review.",
      };
    }

    const profile = await prisma.spenderProfile.findUnique({
      select: {
        monthlyGoalKobo: true,
      },
      where: {
        userId: ctx.auth.session.user.id,
      },
    });

    if (profile && profile.monthlyGoalKobo > 0) {
      return {
        complete: true,
        href: "/requests",
        label: "Browse donation requests",
        summary: "Find approved requests and give anonymously.",
      };
    }

    return {
      complete: false,
      href: "/goals",
      label: "Set monthly giving goal",
      summary: "Create a private sadaqah target and track progress quietly.",
    };
  }),
});
