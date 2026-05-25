import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { readDatabaseRuntimeConfig } from "./runtime";

const globalForPrisma = globalThis as typeof globalThis & {
  alInfaaqPrisma?: PrismaClient;
};

function createPrismaClient() {
  const { connectionString } = readDatabaseRuntimeConfig();

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create the Prisma client.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export const prisma = globalForPrisma.alInfaaqPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.alInfaaqPrisma = prisma;
}

export type DatabaseClient = typeof prisma;
