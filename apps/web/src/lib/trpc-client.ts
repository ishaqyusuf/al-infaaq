"use client";

import type { AppRouter } from "@al-infaaq/api/router";
import { resolveApiUrl } from "@al-infaaq/utils";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: `${resolveApiUrl()}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
