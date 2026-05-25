import { isUserRole, type UserRole } from "@al-infaaq/utils";
import { auth } from "./server";

export { type Permission, roleHasPermission } from "./permissions";
export { auth } from "./server";
export {
  authCookiePrefix,
  authRoutes,
  authSessionCookieName,
  type SessionBridgeInput,
  sessionBridgeInputSchema,
} from "./shared";

export type AuthenticatedUser = {
  email?: string;
  id: string;
  name?: string;
  role: UserRole;
};

export type AuthSessionContext = {
  session: {
    user: AuthenticatedUser;
  } | null;
};

function normalizeSessionRole(role: unknown): UserRole {
  if (typeof role === "string") {
    const lowerRole = role.toLowerCase();

    if (isUserRole(lowerRole)) {
      return lowerRole;
    }
  }

  return "spender";
}

export async function readAuthSessionFromHeaders(
  headers: Headers,
): Promise<AuthSessionContext> {
  const betterAuthSession = await auth.api.getSession({
    headers,
  });

  if (!betterAuthSession?.user) {
    return { session: null };
  }

  const user = betterAuthSession.user as typeof betterAuthSession.user & {
    role?: unknown;
  };

  return {
    session: {
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
        role: normalizeSessionRole(user.role),
      },
    },
  };
}
