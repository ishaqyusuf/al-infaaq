"use server";

import { prisma } from "@al-infaaq/db";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/server-auth";

export async function suspendFoundation(formData: FormData) {
  const session = await requireRole(["admin"]);
  const foundationId = formData.get("foundationId");

  if (typeof foundationId !== "string") {
    throw new Error("Foundation ID is required.");
  }

  await prisma.$transaction([
    prisma.foundation.update({
      data: {
        status: "SUSPENDED",
      },
      where: {
        id: foundationId,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "foundation.suspended",
        actorId: session.user.id,
        target: foundationId,
      },
    }),
  ]);

  revalidatePath("/admin");
}

export async function restoreFoundation(formData: FormData) {
  const session = await requireRole(["admin"]);
  const foundationId = formData.get("foundationId");

  if (typeof foundationId !== "string") {
    throw new Error("Foundation ID is required.");
  }

  await prisma.$transaction([
    prisma.foundation.update({
      data: {
        status: "APPROVED",
      },
      where: {
        id: foundationId,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "foundation.restored",
        actorId: session.user.id,
        target: foundationId,
      },
    }),
  ]);

  revalidatePath("/admin");
}
