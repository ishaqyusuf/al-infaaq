import { createAuthClient } from "better-auth/react";

const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3902";

export const authClient = createAuthClient({
  baseURL: apiOrigin,
});
