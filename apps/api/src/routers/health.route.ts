import { z } from "zod";

import { getHealth } from "../db/queries/health";
import { createTRPCRouter, publicProcedure } from "../lib.trpc";

const healthInputSchema = z.object({}).optional();

export const healthRouter = createTRPCRouter({
  status: publicProcedure.input(healthInputSchema).query(({ ctx }) => {
    return getHealth(ctx);
  }),
});
