export const USER_ROLES = [
  "spender",
  "foundation",
  "trustee",
  "admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS = {
  admin: "Super Admin",
  foundation: "Foundation",
  spender: "Al-Muhsin",
  trustee: "Trustee",
} satisfies Record<UserRole, string>;

export function isUserRole(value: string | undefined): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}
