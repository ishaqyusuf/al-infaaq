import { prisma, readDatabaseRuntimeConfig } from "@al-infaaq/db";

export type MonthlyReminderRun = {
  queued: number;
  status: "dry-run" | "ready";
};

export async function queueMonthlyGivingReminders(): Promise<MonthlyReminderRun> {
  const db = readDatabaseRuntimeConfig();

  if (db.status !== "connected") {
    return {
      queued: 0,
      status: "dry-run",
    };
  }

  const profiles = await prisma.spenderProfile.findMany({
    where: {
      monthlyGoalKobo: {
        gt: 0,
      },
    },
  });

  const scheduledAt = new Date();
  scheduledAt.setMonth(scheduledAt.getMonth() + 1);
  scheduledAt.setDate(1);
  scheduledAt.setHours(9, 0, 0, 0);

  if (profiles.length > 0) {
    await prisma.reminder.createMany({
      data: profiles.map((profile) => ({
        channel: profile.reminderChannel,
        scheduledAt,
        userId: profile.userId,
      })),
    });
  }

  return {
    queued: profiles.length,
    status: "ready",
  };
}
