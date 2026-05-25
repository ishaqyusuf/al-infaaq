import { auth } from "@al-infaaq/auth";
import { serve } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { buildRequestContext, createTRPCContext } from "./context";
import { appRouter } from "./routers/_app";

const app = new Hono();
const webOrigin = process.env.WEB_APP_URL ?? "http://localhost:3000";

app.use(
  "/api/auth/*",
  cors({
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    origin: webOrigin,
  }),
);

app.use(
  "/trpc/*",
  cors({
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    origin: webOrigin,
  }),
);

app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/", (c) => {
  return c.json({
    message: "Al-Infaaq API",
    status: "ok",
  });
});

app.get("/health", async (c) => {
  const context = await buildRequestContext(c.req.raw.headers);

  return c.json({
    api: "ok",
    auth: context.auth.session ? "session-present" : "anonymous",
    database: context.db.status,
    provider: context.db.provider,
    timestamp: new Date().toISOString(),
  });
});

app.all("/trpc/*", async (c) => {
  return fetchRequestHandler({
    createContext: createTRPCContext,
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
  });
});

const port = Number(process.env.API_PORT ?? process.env.PORT ?? 3902);

serve(
  {
    fetch: app.fetch,
    port,
  },
  () => {
    console.log(`Al-Infaaq API listening on http://localhost:${port}`);
  },
);
