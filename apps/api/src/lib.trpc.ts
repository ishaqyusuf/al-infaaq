import { type Permission, roleHasPermission } from "@al-infaaq/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import type { TRPCContext } from "./context";

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceAuthenticatedSession = t.middleware(({ ctx, next }) => {
  if (!ctx.auth.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication is required.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: {
        session: ctx.auth.session,
      },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuthenticatedSession);

export function permissionProcedure(permission: Permission) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!roleHasPermission(ctx.auth.session.user.role, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to perform this action.",
      });
    }

    return next();
  });
}
