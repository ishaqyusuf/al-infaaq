import { prisma } from "@al-infaaq/db";
import { nairaToKobo } from "@al-infaaq/utils";
import { z } from "zod";

import { createTRPCRouter, permissionProcedure } from "../lib.trpc";

function nextMonthReminderDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(1);
  date.setHours(9, 0, 0, 0);
  return date;
}

const saveGoalInputSchema = z.object({
  monthlyGoalNaira: z.number().min(0),
  reminderChannel: z.enum(["EMAIL", "SMS", "WHATSAPP"]).default("EMAIL"),
  remindersEnabled: z.boolean().default(true),
  showSpendingHistory: z.boolean().default(false),
});

export const goalsRouter = createTRPCRouter({
  summary: permissionProcedure("donations:read-own").query(async ({ ctx }) => {
    const [profile, successfulDonations, nextReminder] = await Promise.all([
      prisma.spenderProfile.findUnique({
        where: {
          userId: ctx.auth.session.user.id,
        },
      }),
      prisma.donation.aggregate({
        _sum: {
          amountKobo: true,
        },
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
          spenderId: ctx.auth.session.user.id,
          status: "SUCCEEDED",
        },
      }),
      prisma.reminder.findFirst({
        orderBy: {
          scheduledAt: "asc",
        },
        where: {
          scheduledAt: {
            gte: new Date(),
          },
          sentAt: null,
          userId: ctx.auth.session.user.id,
        },
      }),
    ]);

    return {
      donatedKobo: successfulDonations._sum.amountKobo ?? 0,
      nextReminder,
      profile,
    };
  }),
  save: permissionProcedure("donations:read-own")
    .input(saveGoalInputSchema)
    .mutation(async ({ ctx, input }) => {
      const monthlyGoalKobo = nairaToKobo(input.monthlyGoalNaira);

      const profile = await prisma.spenderProfile.upsert({
        create: {
          monthlyGoalKobo,
          reminderChannel: input.reminderChannel,
          remindersEnabled: input.remindersEnabled,
          showSpendingHistory: input.showSpendingHistory,
          userId: ctx.auth.session.user.id,
        },
        update: {
          monthlyGoalKobo,
          reminderChannel: input.reminderChannel,
          remindersEnabled: input.remindersEnabled,
          showSpendingHistory: input.showSpendingHistory,
        },
        where: {
          userId: ctx.auth.session.user.id,
        },
      });

      await prisma.reminder.deleteMany({
        where: {
          scheduledAt: {
            gte: new Date(),
          },
          sentAt: null,
          userId: ctx.auth.session.user.id,
        },
      });

      if (monthlyGoalKobo > 0) {
        await prisma.$transaction([
          prisma.spendingGoal.create({
            data: {
              monthlyAmountKobo: monthlyGoalKobo,
              spenderProfileId: profile.id,
            },
          }),
          ...(input.remindersEnabled
            ? [
                prisma.reminder.create({
                  data: {
                    channel: input.reminderChannel,
                    scheduledAt: nextMonthReminderDate(),
                    userId: ctx.auth.session.user.id,
                  },
                }),
              ]
            : []),
        ]);
      }

      await prisma.auditLog.create({
        data: {
          action: "spender.goal_saved",
          actorId: ctx.auth.session.user.id,
          target: profile.id,
        },
      });

      return profile;
    }),
});
