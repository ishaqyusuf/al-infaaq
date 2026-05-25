import { z } from "zod";

export const authCookiePrefix = "al-infaaq";
export const authSessionCookieName = `${authCookiePrefix}.session_token`;

export const authRoutes = {
  dashboardHome: "/",
  foundationApply: "/foundations/apply",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export const sessionBridgeInputSchema = z.object({
  role: z.enum(["spender", "foundation", "trustee", "admin"]),
  userId: z.string(),
});

export type SessionBridgeInput = z.infer<typeof sessionBridgeInputSchema>;
