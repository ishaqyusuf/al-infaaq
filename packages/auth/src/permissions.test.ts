import { describe, expect, test } from "bun:test";
import type { UserRole } from "@al-infaaq/utils";
import { type Permission, roleHasPermission } from "./permissions";

const roleMatrix: Record<UserRole, Permission[]> = {
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
  spender: ["donations:create", "donations:read-own"],
  trustee: ["foundations:approve"],
};

const allPermissions = [...new Set(Object.values(roleMatrix).flat())];

describe("roleHasPermission", () => {
  for (const [role, allowedPermissions] of Object.entries(roleMatrix) as Array<
    [UserRole, Permission[]]
  >) {
    test(`${role} permissions match the product role boundary`, () => {
      for (const permission of allPermissions) {
        expect(roleHasPermission(role, permission)).toBe(
          allowedPermissions.includes(permission),
        );
      }
    });
  }

  test("Trustees cannot collect donations or manage requests", () => {
    expect(roleHasPermission("trustee", "donations:create")).toBe(false);
    expect(roleHasPermission("trustee", "requests:create")).toBe(false);
    expect(roleHasPermission("trustee", "requests:publish")).toBe(false);
  });

  test("Foundations cannot approve their own Trustee review", () => {
    expect(roleHasPermission("foundation", "foundations:approve")).toBe(false);
  });
});
