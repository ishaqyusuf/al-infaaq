import { provisionRoles } from "@al-infaaq/auth/provision-roles";

async function main() {
  const { prisma } = await import("../packages/db/src/client");

  try {
    await provisionRoles({
      env: process.env,
      log: console.log,
      prisma,
    });
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
