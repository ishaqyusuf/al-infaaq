import { prisma } from "@al-infaaq/db";

type ProvisionRole = "ADMIN" | "TRUSTEE";

type ProvisionTarget = {
  email: string;
  role: ProvisionRole;
};

function parseEmailList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function readProvisionTargets(env: Record<string, string | undefined>) {
  const targets = new Map<string, ProvisionTarget>();

  for (const email of parseEmailList(env.AL_INFAAQ_ADMIN_EMAILS)) {
    targets.set(email, { email, role: "ADMIN" });
  }

  for (const email of parseEmailList(env.AL_INFAAQ_TRUSTEE_EMAILS)) {
    if (!targets.has(email)) {
      targets.set(email, { email, role: "TRUSTEE" });
    }
  }

  return [...targets.values()];
}

async function main() {
  const targets = readProvisionTargets(process.env);

  if (targets.length === 0) {
    throw new Error(
      "Set AL_INFAAQ_ADMIN_EMAILS and/or AL_INFAAQ_TRUSTEE_EMAILS before provisioning roles.",
    );
  }

  const users = await prisma.user.findMany({
    select: {
      email: true,
      id: true,
      role: true,
    },
    where: {
      email: {
        in: targets.map((target) => target.email),
      },
    },
  });
  const usersByEmail = new Map(users.map((user) => [user.email, user]));
  const missingEmails = targets
    .filter((target) => !usersByEmail.has(target.email))
    .map((target) => target.email);

  if (missingEmails.length > 0) {
    throw new Error(
      `Cannot provision roles for missing Better Auth users: ${missingEmails.join(", ")}`,
    );
  }

  for (const target of targets) {
    const user = usersByEmail.get(target.email);

    if (!user) {
      continue;
    }

    await prisma.user.update({
      data: {
        role: target.role,
      },
      where: {
        id: user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "user.role_provisioned",
        actorId: null,
        metadata: {
          email: target.email,
          previousRole: user.role,
          role: target.role,
        },
        target: user.id,
      },
    });

    console.log(`Provisioned ${target.email} as ${target.role}.`);
  }
}

if (import.meta.main) {
  main()
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
