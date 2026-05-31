import { describe, expect, test } from "bun:test";

import {
  nextMonthlyReminderDate,
  processDueEmailReminders,
  queueMonthlyGivingReminders,
} from "./monthly-reminders";

type QueueOptions = NonNullable<
  Parameters<typeof queueMonthlyGivingReminders>[0]
>;
type ReminderClient = NonNullable<QueueOptions["db"]>;
type ReminderRow = {
  channel: "EMAIL" | "SMS" | "WHATSAPP";
  id: string;
  scheduledAt: Date;
  sentAt: Date | null;
  userId: string;
};

function createReminderClient({
  profiles = [],
  reminders = [],
  users = [],
}: {
  profiles?: Array<{
    reminderChannel: "EMAIL" | "SMS" | "WHATSAPP";
    remindersEnabled?: boolean;
    monthlyGoalKobo?: number;
    userId: string;
  }>;
  reminders?: ReminderRow[];
  users?: Array<{ email: string; id: string; name: string | null }>;
}) {
  return {
    reminders,
    client: {
      reminder: {
        async createMany(args) {
          for (const reminder of args.data) {
            reminders.push({
              ...reminder,
              id: `reminder_${reminders.length + 1}`,
              sentAt: null,
            });
          }

          return { count: args.data.length };
        },
        async findMany(args) {
          return reminders
            .filter((reminder) => {
              const scheduledAt = args.where.scheduledAt;

              if (
                args.where.channel &&
                reminder.channel !== args.where.channel
              ) {
                return false;
              }

              if (args.where.sentAt === null && reminder.sentAt !== null) {
                return false;
              }

              if (
                args.where.userId?.in &&
                !args.where.userId.in.includes(reminder.userId)
              ) {
                return false;
              }

              if (scheduledAt?.gte && reminder.scheduledAt < scheduledAt.gte) {
                return false;
              }

              if (scheduledAt?.lt && reminder.scheduledAt >= scheduledAt.lt) {
                return false;
              }

              if (scheduledAt?.lte && reminder.scheduledAt > scheduledAt.lte) {
                return false;
              }

              return true;
            })
            .slice(0, args.take);
        },
        async updateMany(args) {
          let count = 0;

          for (const reminder of reminders) {
            if (
              args.where.id.in.includes(reminder.id) &&
              reminder.sentAt === null
            ) {
              reminder.sentAt = args.data.sentAt;
              count += 1;
            }
          }

          return { count };
        },
      },
      spenderProfile: {
        async findMany(args) {
          return profiles.filter((profile) => {
            if (
              args.where.remindersEnabled &&
              profile.remindersEnabled === false
            ) {
              return false;
            }

            if (
              args.where.monthlyGoalKobo?.gt !== undefined &&
              (profile.monthlyGoalKobo ?? 1) <= args.where.monthlyGoalKobo.gt
            ) {
              return false;
            }

            if (
              args.where.userId?.in &&
              !args.where.userId.in.includes(profile.userId)
            ) {
              return false;
            }

            return true;
          });
        },
      },
      user: {
        async findMany(args) {
          return users.filter((user) => args.where.id.in.includes(user.id));
        },
      },
    } satisfies ReminderClient,
  };
}

describe("monthly reminder jobs", () => {
  test("queues next-month reminders without duplicating existing user/channel rows", async () => {
    const now = new Date("2026-05-15T12:00:00.000Z");
    const scheduledAt = nextMonthlyReminderDate(now);
    const { client, reminders } = createReminderClient({
      profiles: [
        { reminderChannel: "EMAIL", userId: "user_1" },
        { reminderChannel: "SMS", userId: "user_2" },
        {
          reminderChannel: "EMAIL",
          remindersEnabled: false,
          userId: "user_3",
        },
      ],
      reminders: [
        {
          channel: "EMAIL",
          id: "existing",
          scheduledAt,
          sentAt: null,
          userId: "user_1",
        },
      ],
    });

    const result = await queueMonthlyGivingReminders({ db: client, now });

    expect(result).toEqual({
      queued: 1,
      skippedExisting: 1,
      status: "ready",
    });
    expect(reminders).toHaveLength(2);
    expect(reminders.at(-1)).toMatchObject({
      channel: "SMS",
      scheduledAt,
      userId: "user_2",
    });
  });

  test("sends due email reminders and marks successful rows as sent", async () => {
    const now = new Date("2026-05-25T09:00:00.000Z");
    const { client, reminders } = createReminderClient({
      reminders: [
        {
          channel: "EMAIL",
          id: "reminder_1",
          scheduledAt: new Date("2026-05-25T08:00:00.000Z"),
          sentAt: null,
          userId: "user_1",
        },
        {
          channel: "EMAIL",
          id: "reminder_disabled",
          scheduledAt: new Date("2026-05-25T08:15:00.000Z"),
          sentAt: null,
          userId: "user_disabled",
        },
        {
          channel: "EMAIL",
          id: "reminder_2",
          scheduledAt: new Date("2026-05-25T08:30:00.000Z"),
          sentAt: null,
          userId: "missing_user",
        },
      ],
      profiles: [
        { reminderChannel: "EMAIL", userId: "user_1" },
        {
          reminderChannel: "EMAIL",
          remindersEnabled: false,
          userId: "user_disabled",
        },
      ],
      users: [{ email: "donor@example.com", id: "user_1", name: "Donor" }],
    });
    const sentTo: string[] = [];

    const result = await processDueEmailReminders({
      db: client,
      now,
      sendEmail: async (email) => {
        sentTo.push(email.to);
      },
    });

    expect(result).toEqual({
      sent: 1,
      skipped: 2,
      status: "ready",
    });
    expect(sentTo).toEqual(["donor@example.com"]);
    expect(reminders[0]?.sentAt).toEqual(now);
    expect(reminders[1]?.sentAt).toBeNull();
    expect(reminders[2]?.sentAt).toBeNull();
  });
});
