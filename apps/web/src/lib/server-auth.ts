import { isUserRole, USER_ROLE_LABELS, type UserRole } from "@al-infaaq/utils";
import { resolveApiUrl } from "@al-infaaq/utils/runtime-url";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type BetterAuthSessionPayload = {
  session?: {
    id: string;
  };
  user?: {
    email?: string;
    id: string;
    name?: string | null;
    role?: unknown;
  };
} | null;

export type WebAuthSession = {
  user: {
    email?: string;
    id: string;
    name?: string | null;
    role: UserRole;
    roleLabel: string;
  };
};

function normalizeRole(role: unknown): UserRole {
  if (typeof role === "string") {
    const normalized = role.toLowerCase();

    if (isUserRole(normalized)) {
      return normalized;
    }
  }

  return "spender";
}

export async function getServerAuthSession(): Promise<WebAuthSession | null> {
  const requestHeaders = await headers();
  let response: Response;

  try {
    response = await fetch(`${resolveApiUrl()}/api/auth/get-session`, {
      cache: "no-store",
      headers: {
        cookie: requestHeaders.get("cookie") ?? "",
      },
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as BetterAuthSessionPayload;

  if (!payload?.user) {
    return null;
  }

  const role = normalizeRole(payload.user.role);

  return {
    user: {
      email: payload.user.email,
      id: payload.user.id,
      name: payload.user.name,
      role,
      roleLabel: USER_ROLE_LABELS[role],
    },
  };
}

export async function requireServerAuthSession() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireServerAuthSession();

  if (!roles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  return session;
}
