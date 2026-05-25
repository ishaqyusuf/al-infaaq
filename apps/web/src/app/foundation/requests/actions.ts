"use server";

import { prisma } from "@al-infaaq/db";
import { nairaToKobo } from "@al-infaaq/utils";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/server-auth";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function asNaira(value: FormDataEntryValue | null) {
  const parsed = Number(asString(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export async function createDonationRequest(formData: FormData) {
  const session = await requireRole(["foundation", "admin"]);
  const title = asString(formData.get("title"));
  const story = asString(formData.get("story"));
  const targetNaira = asNaira(formData.get("targetNaira"));

  if (!title || !story || targetNaira <= 0) {
    throw new Error("Title, story, and target amount are required.");
  }

  const foundation = await prisma.foundation.findFirst({
    where:
      session.user.role === "admin"
        ? { status: "APPROVED" }
        : { status: "APPROVED", userId: session.user.id },
  });

  if (!foundation) {
    throw new Error("An approved foundation is required to create requests.");
  }

  const request = await prisma.donationRequest.create({
    data: {
      foundationId: foundation.id,
      story,
      targetKobo: nairaToKobo(targetNaira),
      title,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "donation_request.created",
      actorId: session.user.id,
      target: request.id,
    },
  });

  revalidatePath("/foundation/requests");
}

export async function publishDonationRequest(formData: FormData) {
  const session = await requireRole(["foundation", "admin"]);
  const requestId = formData.get("requestId");

  if (typeof requestId !== "string") {
    throw new Error("Request ID is required.");
  }

  const request = await prisma.donationRequest.findUnique({
    include: {
      foundation: true,
    },
    where: {
      id: requestId,
    },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  if (
    session.user.role !== "admin" &&
    request.foundation.userId !== session.user.id
  ) {
    throw new Error("You can only publish your own foundation requests.");
  }

  if (request.foundation.status !== "APPROVED") {
    throw new Error("Only approved foundations can publish requests.");
  }

  await prisma.donationRequest.update({
    data: {
      publishedAt: new Date(),
      status: "PUBLISHED",
    },
    where: {
      id: requestId,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "donation_request.published",
      actorId: session.user.id,
      target: requestId,
    },
  });

  revalidatePath("/foundation/requests");
  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
}
