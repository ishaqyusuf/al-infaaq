import { createTRPCRouter } from "../lib.trpc";
import { healthRouter } from "./health.route";
import { paymentsRouter } from "./payments.route";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
