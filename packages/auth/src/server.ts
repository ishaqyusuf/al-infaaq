import { prisma } from "@al-infaaq/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

function uniqueOrigins(origins: Array<string | undefined>) {
  return [...new Set(origins.filter(Boolean))] as string[];
}

const apiOrigin =
  process.env.BETTER_AUTH_URL ??
  process.env.API_ORIGIN ??
  `http://localhost:${process.env.API_PORT ?? "3902"}`;

const webOrigin =
  process.env.WEB_APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

export const auth = betterAuth({
  appName: "Al-Infaaq",
  basePath: "/api/auth",
  baseURL: apiOrigin,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
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
