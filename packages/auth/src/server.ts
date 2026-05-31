import { prisma } from "@al-infaaq/db";
import { resolveApiUrl, resolveAppUrl } from "@al-infaaq/utils";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { resolveRegisteredUserRole } from "./first-user-admin";
import { authCookiePrefix } from "./shared";

function uniqueOrigins(origins: Array<string | undefined>) {
  return [...new Set(origins.filter(Boolean))] as string[];
}

const apiOrigin = resolveApiUrl({
  fallbackOrigin: `http://localhost:${process.env.API_PORT ?? "3902"}`,
});
const webOrigin = resolveAppUrl();

export function getAuthSecret(): string {
  return process.env.BETTER_AUTH_SECRET ?? "al-infaaq-local-dev-secret";
}

export const auth = betterAuth({
  advanced: {
    cookiePrefix: authCookiePrefix,
  },
  appName: "Al-Infaaq",
  basePath: "/api/auth",
  baseURL: apiOrigin,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: await resolveRegisteredUserRole(prisma),
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  secret: getAuthSecret(),
  trustedOrigins: uniqueOrigins([
    webOrigin,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.WEB_APP_URL,
  ]),
  user: {
    additionalFields: {
      role: {
        defaultValue: "SPENDER",
        input: false,
        required: true,
        type: "string",
      },
    },
  },
});

export type BetterAuth = typeof auth;
