import type { UserRole } from "@al-infaaq/utils";

export type Permission =
  | "donations:create"
  | "donations:read-own"
  | "foundations:apply"
  | "foundations:approve"
  | "requests:create"
  | "requests:publish"
  | "admin:manage";

const rolePermissions = {
  admin: [
    "admin:manage",
    "donations:create",
    "donations:read-own",
    "foundations:apply",
    "foundations:approve",
    "requests:create",
    "requests:publish",
  ],
  foundation: ["foundations:apply", "requests:create", "requests:publish"],
  spender: ["donations:create", "donations:read-own", "foundations:apply"],
  trustee: ["foundations:approve"],
} satisfies Record<UserRole, Permission[]>;

export function roleHasPermission(role: UserRole, permission: Permission) {
  return (rolePermissions[role] as readonly Permission[]).includes(permission);
}
