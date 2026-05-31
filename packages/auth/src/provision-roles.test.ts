import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  type ProvisionPrisma,
  type ProvisionUser,
  provisionRoles,
  readProvisionTargets,
} from "./provision-roles";

const prismaMock = {
  auditLog: {
    create: mock(async (input: unknown) => input),
  },
  user: {
    findMany: mock(async () => [] as ProvisionUser[]),
    update: mock(async (input: unknown) => input),
  },
} satisfies ProvisionPrisma;

function resetMocks() {
  prismaMock.auditLog.create.mockClear();
  prismaMock.user.findMany.mockClear();
  prismaMock.user.update.mockClear();
}

describe("role provisioning", () => {
  beforeEach(() => {
    resetMocks();
  });

  test("reads normalized admin and Trustee targets with admin precedence", () => {
    expect(
      readProvisionTargets({
        AL_INFAAQ_ADMIN_EMAILS: " Admin@Alinfaaq.test, owner@test ",
        AL_INFAAQ_TRUSTEE_EMAILS: "admin@alinfaaq.test, trustee@test",
      }),
    ).toEqual([
      {
        email: "admin@alinfaaq.test",
        role: "ADMIN",
      },
      {
        email: "owner@test",
        role: "ADMIN",
      },
      {
        email: "trustee@test",
        role: "TRUSTEE",
      },
    ]);
  });

  test("fails fast when no provisioning targets are configured", async () => {
    await expect(
      provisionRoles({
        env: {},
        prisma: prismaMock,
      }),
    ).rejects.toThrow(
      "Set AL_INFAAQ_ADMIN_EMAILS and/or AL_INFAAQ_TRUSTEE_EMAILS before provisioning roles.",
    );

    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });

  test("fails before mutating when configured users do not exist", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      {
        email: "admin@alinfaaq.test",
        id: "admin-user",
        role: "SPENDER",
      },
    ] as never);

    await expect(
      provisionRoles({
        env: {
          AL_INFAAQ_ADMIN_EMAILS: "admin@alinfaaq.test",
          AL_INFAAQ_TRUSTEE_EMAILS: "trustee@alinfaaq.test",
        },
        prisma: prismaMock,
      }),
    ).rejects.toThrow(
      "Cannot provision roles for missing Better Auth users: trustee@alinfaaq.test",
    );

    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  test("promotes existing users and writes role provisioning audit logs", async () => {
    const logs: string[] = [];

    prismaMock.user.findMany.mockResolvedValueOnce([
      {
        email: "admin@alinfaaq.test",
        id: "admin-user",
        role: "SPENDER",
      },
      {
        email: "trustee@alinfaaq.test",
        id: "trustee-user",
        role: "SPENDER",
      },
    ] as never);

    await expect(
      provisionRoles({
        env: {
          AL_INFAAQ_ADMIN_EMAILS: "admin@alinfaaq.test",
          AL_INFAAQ_TRUSTEE_EMAILS: "trustee@alinfaaq.test",
        },
        log: (message) => logs.push(message),
        prisma: prismaMock,
      }),
    ).resolves.toEqual({
      count: 2,
    });

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      select: {
        email: true,
        id: true,
        role: true,
      },
      where: {
        email: {
          in: ["admin@alinfaaq.test", "trustee@alinfaaq.test"],
        },
      },
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      data: {
        role: "ADMIN",
      },
      where: {
        id: "admin-user",
      },
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      data: {
        role: "TRUSTEE",
      },
      where: {
        id: "trustee-user",
      },
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "user.role_provisioned",
        actorId: null,
        metadata: {
          email: "admin@alinfaaq.test",
          previousRole: "SPENDER",
          role: "ADMIN",
        },
        target: "admin-user",
      },
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: "user.role_provisioned",
        actorId: null,
        metadata: {
          email: "trustee@alinfaaq.test",
          previousRole: "SPENDER",
          role: "TRUSTEE",
        },
        target: "trustee-user",
      },
    });
    expect(logs).toEqual([
      "Provisioned admin@alinfaaq.test as ADMIN.",
      "Provisioned trustee@alinfaaq.test as TRUSTEE.",
    ]);
  });
});
