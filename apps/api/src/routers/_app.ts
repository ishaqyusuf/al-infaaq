import { createTRPCRouter } from "../lib.trpc";
import { adminRouter } from "./admin.route";
import { donationsRouter } from "./donations.route";
import { foundationsRouter } from "./foundations.route";
import { goalsRouter } from "./goals.route";
import { healthRouter } from "./health.route";
import { onboardingRouter } from "./onboarding.route";
import { requestsRouter } from "./requests.route";
import { trusteeRouter } from "./trustee.route";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  donations: donationsRouter,
  foundations: foundationsRouter,
  goals: goalsRouter,
  health: healthRouter,
  onboarding: onboardingRouter,
  requests: requestsRouter,
  trustee: trusteeRouter,
});

export type AppRouter = typeof appRouter;
