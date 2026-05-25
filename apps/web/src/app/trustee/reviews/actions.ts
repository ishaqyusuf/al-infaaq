"use server";

import { prisma } from "@al-infaaq/db";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/server-auth";

function readNotes(formData: FormData) {
  const value = formData.get("notes");
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function decideReview(
  formData: FormData,
  status: "APPROVED" | "REJECTED",
) {
  const session = await requireRole(["trustee", "admin"]);
  const reviewId = formData.get("reviewId");

  if (typeof reviewId !== "string") {
    throw new Error("Review ID is required.");
  }

  const review = await prisma.trusteeReview.findUnique({
    include: {
      foundation: true,
    },
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  await prisma.$transaction([
    prisma.trusteeReview.update({
      data: {
        decidedAt: new Date(),
        notes: readNotes(formData),
        status,
        trusteeId: session.user.id,
      },
      where: {
        id: reviewId,
      },
    }),
    prisma.foundation.update({
      data: {
        status: status === "APPROVED" ? "APPROVED" : "REJECTED",
      },
      where: {
        id: review.foundationId,
      },
    }),
    prisma.auditLog.create({
      data: {
        action:
          status === "APPROVED"
            ? "foundation.trustee_review_approved"
            : "foundation.trustee_review_rejected",
        actorId: session.user.id,
        target: review.foundationId,
      },
    }),
  ]);

  revalidatePath("/trustee/reviews");
  revalidatePath("/dashboard");
}

export async function approveFoundationReview(formData: FormData) {
  await decideReview(formData, "APPROVED");
}

export async function rejectFoundationReview(formData: FormData) {
  await decideReview(formData, "REJECTED");
}
