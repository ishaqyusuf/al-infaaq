import type { TRPCContext } from "../../context";

export function getHealth(ctx: TRPCContext) {
  return {
    auth: ctx.auth.session ? "session-present" : "anonymous",
    database: ctx.db.status,
    provider: ctx.db.provider,
    service: "al-infaaq",
    timestamp: new Date().toISOString(),
  };
}
