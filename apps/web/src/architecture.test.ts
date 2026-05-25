import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const appRoot = join(import.meta.dir, "app");

function walkFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);

    return stat.isDirectory() ? walkFiles(path) : [path];
  });
}

function readSource(path: string) {
  return readFileSync(path, "utf8");
}

const appFiles = walkFiles(appRoot).filter((path) => /\.(ts|tsx)$/.test(path));

describe("web architecture guardrails", () => {
  test("product workflows do not use Next server actions", () => {
    const offenders = appFiles
      .filter((path) => !relative(appRoot, path).startsWith("api/"))
      .filter((path) => {
        const source = readSource(path);
        return (
          source.includes('"use server"') ||
          source.includes("'use server'") ||
          source.includes(" action=") ||
          source.includes(" formAction=") ||
          source.includes('from "./actions"') ||
          source.includes("from './actions'")
        );
      });

    expect(offenders.map((path) => relative(appRoot, path))).toEqual([]);
  });

  test("server-rendered pages read domain data through tRPC, not Prisma", () => {
    const pageFiles = appFiles.filter((path) => path.endsWith("page.tsx"));
    const offenders = pageFiles.filter((path) =>
      readSource(path).includes("@al-infaaq/db"),
    );

    expect(offenders.map((path) => relative(appRoot, path))).toEqual([]);
  });

  test("database-backed pages opt out of static prerendering", () => {
    const pageFiles = appFiles.filter((path) => path.endsWith("page.tsx"));
    const offenders = pageFiles
      .filter((path) => readSource(path).includes("createServerTrpcCaller"))
      .filter(
        (path) => !readSource(path).includes('dynamic = "force-dynamic"'),
      );

    expect(offenders.map((path) => relative(appRoot, path))).toEqual([]);
  });

  test("framework route handlers remain the only web Prisma exceptions", () => {
    const prismaImports = appFiles
      .filter((path) => readSource(path).includes("@al-infaaq/db"))
      .map((path) => relative(appRoot, path))
      .sort();

    expect(prismaImports).toEqual([
      "api/payments/_shared.ts",
      "api/requests/[id]/banner/route.ts",
    ]);
  });

  test("payment route handlers are webhook-only", () => {
    const paymentRouteFiles = appFiles
      .filter((path) => relative(appRoot, path).startsWith("api/payments/"))
      .map((path) => relative(appRoot, path))
      .sort();

    expect(paymentRouteFiles).toEqual([
      "api/payments/_shared.ts",
      "api/payments/lemonsqueezy/webhook/route.ts",
      "api/payments/paystack/webhook/route.ts",
    ]);
  });
});
