"use server";

import { prisma } from "@al-infaaq/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireServerAuthSession } from "@/lib/server-auth";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function submitFoundationForReview(formData: FormData) {
  const session = await requireServerAuthSession();

  if (session.user.role === "trustee") {
    redirect("/dashboard");
  }

  const name = asString(formData.get("name"));
  const description = asString(formData.get("description"));

  if (!name || !description) {
    throw new Error("Foundation name and description are required.");
  }

  const contactEmail =
    asString(formData.get("contactEmail")) || session.user.email || null;
  const registrationNumber =
    asString(formData.get("registrationNumber")) || null;
  const websiteUrl = asString(formData.get("websiteUrl")) || null;
  const documentUrl = asString(formData.get("documentUrl")) || null;
  const slug = slugify(name);

  const foundation = await prisma.foundation.upsert({
    create: {
      contactEmail,
      description,
      documentUrl,
      name,
      registrationNumber,
      slug,
      status: "PENDING_REVIEW",
      userId: session.user.id,
      websiteUrl,
    },
    update: {
      contactEmail,
      description,
      documentUrl,
      name,
      registrationNumber,
      status: "PENDING_REVIEW",
      websiteUrl,
    },
    where: {
      userId: session.user.id,
    },
  });

  await prisma.user.update({
    data: {
      role: "FOUNDATION",
    },
    where: {
      id: session.user.id,
    },
  });

  const existingPendingReview = await prisma.trusteeReview.findFirst({
    where: {
      foundationId: foundation.id,
      status: "PENDING",
    },
  });

  if (!existingPendingReview) {
    await prisma.trusteeReview.create({
      data: {
        foundationId: foundation.id,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "foundation.submitted_for_trustee_review",
      actorId: session.user.id,
      target: foundation.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/foundations/apply");
  revalidatePath("/trustee/reviews");
  redirect("/foundations/apply");
}
