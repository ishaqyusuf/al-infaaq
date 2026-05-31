export type ProvisionRole = "ADMIN" | "TRUSTEE";

export type ProvisionTarget = {
  email: string;
  role: ProvisionRole;
};

export type ProvisionUser = {
  email: string;
  id: string;
  role: string;
};

export type ProvisionPrisma = {
  auditLog: {
    create(input: {
      data: {
        action: "user.role_provisioned";
        actorId: null;
        metadata: {
          email: string;
          previousRole: string;
          role: ProvisionRole;
        };
        target: string;
      };
    }): Promise<unknown>;
  };
  user: {
    findMany(input: {
      select: {
        email: true;
        id: true;
        role: true;
      };
      where: {
        email: {
          in: string[];
        };
      };
    }): Promise<ProvisionUser[]>;
    update(input: {
      data: {
        role: ProvisionRole;
      };
      where: {
        id: string;
      };
    }): Promise<unknown>;
  };
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

export async function provisionRoles({
  env,
  log = () => undefined,
  prisma,
}: {
  env: Record<string, string | undefined>;
  log?: (message: string) => void;
  prisma: ProvisionPrisma;
}) {
  const targets = readProvisionTargets(env);

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

    log(`Provisioned ${target.email} as ${target.role}.`);
  }

  return {
    count: targets.length,
  };
}
