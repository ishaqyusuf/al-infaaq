"use client";

import type { AppRouter } from "@al-infaaq/api/router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3902";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: `${apiOrigin}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
