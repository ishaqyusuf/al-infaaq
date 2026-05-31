import { readDatabaseRuntimeConfig } from "@al-infaaq/db/runtime";

type ReminderChannel = "EMAIL" | "SMS" | "WHATSAPP";

type SpenderProfileReminder = {
  reminderChannel: ReminderChannel;
  userId: string;
};

type ActiveReminderProfile = {
  userId: string;
};

type ReminderRecord = {
  channel: ReminderChannel;
  id: string;
  scheduledAt: Date;
  userId: string;
};

type ReminderUser = {
  email: string;
  id: string;
  name: string | null;
};

type ReminderClient = {
  reminder: {
    createMany(args: {
      data: Array<{
        channel: ReminderChannel;
        scheduledAt: Date;
        userId: string;
      }>;
    }): Promise<{ count: number }>;
    findMany(args: {
      orderBy?: { scheduledAt: "asc" };
      take?: number;
      where: {
        channel?: ReminderChannel;
        scheduledAt?: { gte?: Date; lt?: Date; lte?: Date };
        sentAt?: null;
        userId?: { in: string[] };
      };
    }): Promise<ReminderRecord[]>;
    updateMany(args: {
      data: { sentAt: Date };
      where: { id: { in: string[] }; sentAt: null };
    }): Promise<{ count: number }>;
  };
  spenderProfile: {
    findMany(args: {
      select: { reminderChannel?: true; userId: true };
      where: {
        monthlyGoalKobo?: { gt: number };
        remindersEnabled?: true;
        userId?: { in: string[] };
      };
    }): Promise<Array<ActiveReminderProfile | SpenderProfileReminder>>;
  };
  user: {
    findMany(args: {
      select: { email: true; id: true; name: true };
      where: { id: { in: string[] } };
    }): Promise<ReminderUser[]>;
  };
};

export type MonthlyReminderRun = {
  queued: number;
  skippedExisting: number;
  status: "dry-run" | "ready";
};

export type ReminderEmail = {
  body: string;
  reminderId: string;
  subject: string;
  to: string;
};

export type DueReminderRun = {
  sent: number;
  skipped: number;
  status: "dry-run" | "ready";
};

type QueueMonthlyGivingRemindersOptions = {
  db?: ReminderClient;
  now?: Date;
};

type ProcessDueEmailRemindersOptions = {
  db?: ReminderClient;
  limit?: number;
  now?: Date;
  sendEmail: (email: ReminderEmail) => Promise<void>;
};

async function loadReminderClient() {
  const { prisma } = await import("@al-infaaq/db/client");
  return prisma as unknown as ReminderClient;
}

export function nextMonthlyReminderDate(now = new Date()) {
  const date = new Date(now);
  date.setMonth(date.getMonth() + 1);
  date.setDate(1);
  date.setHours(9, 0, 0, 0);
  return date;
}

function endOfReminderDay(date: Date) {
  const end = new Date(date);
  end.setDate(end.getDate() + 1);
  return end;
}

export async function queueMonthlyGivingReminders({
  db,
  now = new Date(),
}: QueueMonthlyGivingRemindersOptions = {}): Promise<MonthlyReminderRun> {
  if (!db && readDatabaseRuntimeConfig().status !== "connected") {
    return {
      queued: 0,
      skippedExisting: 0,
      status: "dry-run",
    };
  }

  const client = db ?? (await loadReminderClient());
  const scheduledAt = nextMonthlyReminderDate(now);
  const profiles = (await client.spenderProfile.findMany({
    select: {
      reminderChannel: true,
      userId: true,
    },
    where: {
      monthlyGoalKobo: {
        gt: 0,
      },
      remindersEnabled: true,
    },
  })) as SpenderProfileReminder[];

  if (profiles.length === 0) {
    return {
      queued: 0,
      skippedExisting: 0,
      status: "ready",
    };
  }

  const existingReminders = await client.reminder.findMany({
    where: {
      scheduledAt: {
        gte: scheduledAt,
        lt: endOfReminderDay(scheduledAt),
      },
      sentAt: null,
      userId: {
        in: profiles.map((profile) => profile.userId),
      },
    },
  });
  const existingKeys = new Set(
    existingReminders.map(
      (reminder) => `${reminder.userId}:${reminder.channel}`,
    ),
  );
  const remindersToCreate = profiles.filter(
    (profile) =>
      !existingKeys.has(`${profile.userId}:${profile.reminderChannel}`),
  );

  if (remindersToCreate.length > 0) {
    await client.reminder.createMany({
      data: remindersToCreate.map((profile) => ({
        channel: profile.reminderChannel,
        scheduledAt,
        userId: profile.userId,
      })),
    });
  }

  return {
    queued: remindersToCreate.length,
    skippedExisting: profiles.length - remindersToCreate.length,
    status: "ready",
  };
}

export async function processDueEmailReminders({
  db,
  limit = 100,
  now = new Date(),
  sendEmail,
}: ProcessDueEmailRemindersOptions): Promise<DueReminderRun> {
  if (!db && readDatabaseRuntimeConfig().status !== "connected") {
    return {
      sent: 0,
      skipped: 0,
      status: "dry-run",
    };
  }

  const client = db ?? (await loadReminderClient());
  const reminders = await client.reminder.findMany({
    orderBy: { scheduledAt: "asc" },
    take: limit,
    where: {
      channel: "EMAIL",
      scheduledAt: {
        lte: now,
      },
      sentAt: null,
    },
  });

  if (reminders.length === 0) {
    return {
      sent: 0,
      skipped: 0,
      status: "ready",
    };
  }

  const users = await client.user.findMany({
    select: {
      email: true,
      id: true,
      name: true,
    },
    where: {
      id: {
        in: reminders.map((reminder) => reminder.userId),
      },
    },
  });
  const activeProfiles = await client.spenderProfile.findMany({
    select: {
      userId: true,
    },
    where: {
      monthlyGoalKobo: {
        gt: 0,
      },
      remindersEnabled: true,
      userId: {
        in: reminders.map((reminder) => reminder.userId),
      },
    },
  });
  const activeUserIds = new Set(
    activeProfiles.map((profile) => profile.userId),
  );
  const usersById = new Map(users.map((user) => [user.id, user]));
  const sentReminderIds: string[] = [];
  let skipped = 0;

  for (const reminder of reminders) {
    if (!activeUserIds.has(reminder.userId)) {
      skipped += 1;
      continue;
    }

    const user = usersById.get(reminder.userId);

    if (!user) {
      skipped += 1;
      continue;
    }

    await sendEmail({
      body: `Assalamu alaikum${user.name ? ` ${user.name}` : ""}, this is your private Al-Infaaq monthly sadaqah goal reminder.`,
      reminderId: reminder.id,
      subject: "Your Al-Infaaq giving reminder",
      to: user.email,
    });
    sentReminderIds.push(reminder.id);
  }

  if (sentReminderIds.length > 0) {
    await client.reminder.updateMany({
      data: {
        sentAt: now,
      },
      where: {
        id: {
          in: sentReminderIds,
        },
        sentAt: null,
      },
    });
  }

  return {
    sent: sentReminderIds.length,
    skipped,
    status: "ready",
  };
}
