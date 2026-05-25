import {
  type AuthSessionContext,
  readAuthSessionFromHeaders,
} from "@al-infaaq/auth";
import { readDatabaseRuntimeConfig } from "@al-infaaq/db";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export type TRPCContext = {
  auth: AuthSessionContext;
  db: ReturnType<typeof readDatabaseRuntimeConfig>;
  headers: Headers;
};

export async function buildRequestContext(
  headers: Headers,
): Promise<TRPCContext> {
  return {
    auth: await readAuthSessionFromHeaders(headers),
    db: readDatabaseRuntimeConfig(),
    headers,
  };
}

export async function createTRPCContext(
  opts: FetchCreateContextFnOptions,
): Promise<TRPCContext> {
  return await buildRequestContext(opts.req.headers);
}
