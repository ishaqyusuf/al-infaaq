export type FirstUserAdminPrisma = {
  user: {
    count: () => Promise<number>;
  };
};

export async function resolveRegisteredUserRole(prisma: FirstUserAdminPrisma) {
  const userCount = await prisma.user.count();
  return userCount === 0 ? "ADMIN" : "SPENDER";
}
