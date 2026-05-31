import { prisma } from "../packages/db/src/client";

const [, , email, role] = process.argv;
const roleMap = {
  admin: "ADMIN",
  foundation: "FOUNDATION",
  spender: "SPENDER",
  trustee: "TRUSTEE",
} as const;

if (!email || !role || !(role in roleMap)) {
  console.error("Usage: bun run e2e/promote-user.ts <email> <role>");
  process.exit(1);
}

await prisma.user.update({
  data: {
    role: roleMap[role as keyof typeof roleMap],
  },
  where: {
    email,
  },
});

await prisma.$disconnect();
