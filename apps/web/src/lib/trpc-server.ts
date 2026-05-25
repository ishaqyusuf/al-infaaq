import { buildRequestContext } from "@al-infaaq/api/context";
import { appRouter } from "@al-infaaq/api/router";
import { headers } from "next/headers";

export async function createServerTrpcCaller() {
  const requestHeaders = await headers();
  const context = await buildRequestContext(new Headers(requestHeaders));

  return appRouter.createCaller(context);
}
