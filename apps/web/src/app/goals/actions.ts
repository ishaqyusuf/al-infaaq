"use server";

import { prisma } from "@al-infaaq/db";
import { nairaToKobo } from "@al-infaaq/utils";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/server-auth";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function nextMonthReminderDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(1);
  date.setHours(9, 0, 0, 0);
  return date;
}

export async function saveGivingGoal(formData: FormData) {
  const session = await requireRole(["spender", "admin"]);
  const monthlyGoalNaira = Number(asString(formData.get("monthlyGoalNaira")));
  const reminderChannel = asString(formData.get("reminderChannel"));
  const showSpendingHistory = formData.get("showSpendingHistory") === "on";
  const monthlyGoalKobo = nairaToKobo(
    Number.isFinite(monthlyGoalNaira) ? monthlyGoalNaira : 0,
  );

  const channel =
    reminderChannel === "SMS" || reminderChannel === "WHATSAPP"
      ? reminderChannel
      : "EMAIL";

  const profile = await prisma.spenderProfile.upsert({
    create: {
      monthlyGoalKobo,
      reminderChannel: channel,
      showSpendingHistory,
      userId: session.user.id,
    },
    update: {
      monthlyGoalKobo,
      reminderChannel: channel,
      showSpendingHistory,
    },
    where: {
      userId: session.user.id,
    },
  });

  if (monthlyGoalKobo > 0) {
    await prisma.spendingGoal.create({
      data: {
        monthlyAmountKobo: monthlyGoalKobo,
        spenderProfileId: profile.id,
      },
    });

    await prisma.reminder.create({
      data: {
        channel,
        scheduledAt: nextMonthReminderDate(),
        userId: session.user.id,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "spender.goal_saved",
      actorId: session.user.id,
      target: profile.id,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/wallet");
  revalidatePath("/dashboard");
}
