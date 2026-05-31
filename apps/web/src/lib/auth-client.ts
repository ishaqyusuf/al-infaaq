import { resolveApiUrl } from "@al-infaaq/utils";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: resolveApiUrl(),
});
