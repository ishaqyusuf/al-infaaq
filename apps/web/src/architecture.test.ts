import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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
const productionAppFiles = appFiles.filter(
  (path) => !path.endsWith(".test.ts"),
);

describe("web architecture guardrails", () => {
  test("app router has loading and error boundaries", () => {
    const loadingPage = join(appRoot, "loading.tsx");
    const errorPage = join(appRoot, "error.tsx");
    const errorSource = readSource(errorPage);

    expect(existsSync(loadingPage)).toBe(true);
    expect(existsSync(errorPage)).toBe(true);
    expect(errorSource).toContain('"use client"');
    expect(errorSource).toContain("reset");
  });

  test("root layout defaults to dark mode and Trustee-reviewed metadata", () => {
    const layout = join(appRoot, "layout.tsx");
    const source = readSource(layout);

    expect(source).toContain("Trustee-reviewed foundations");
    expect(source).toContain("alinfaaq");
    expect(source).toContain("dark h-full");
  });

  test("public auth pages tolerate unavailable auth API session fetches", () => {
    const source = readSource(join(import.meta.dir, "lib", "server-auth.ts"));

    expect(source).toContain("try {");
    expect(source).toContain("return null");
    expect(source).toContain("/api/auth/get-session");
  });

  test("catch-all route redirects unknown paths home", () => {
    const catchAllPage = join(appRoot, "[...slug]", "page.tsx");
    const source = readSource(catchAllPage);

    expect(existsSync(catchAllPage)).toBe(true);
    expect(source).toContain('from "next/navigation"');
    expect(source).toContain('redirect("/")');
  });

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

  test("dashboard uses tRPC-owned onboarding redirects", () => {
    const dashboardPage = join(appRoot, "dashboard", "page.tsx");
    const source = readSource(dashboardPage);

    expect(source).toContain("createServerTrpcCaller");
    expect(source).toContain("trpc.onboarding.nextStep");
    expect(source).toContain("redirect(nextAction.href)");
  });

  test("table domains follow required folder structure", () => {
    const tablesRoot = join(import.meta.dir, "components", "tables");

    expect(existsSync(join(tablesRoot, "core"))).toBe(true);

    for (const domain of [
      "admin-audit-logs",
      "admin-donations",
      "admin-foundations",
      "admin-requests",
      "foundation-requests",
      "public-requests",
      "trustee-reviews",
      "wallet-donations",
    ]) {
      const tableRoot = join(tablesRoot, domain);

      for (const file of [
        "columns.tsx",
        "data-table.tsx",
        "empty-states.tsx",
        "skeleton.tsx",
        "table-header.tsx",
      ]) {
        expect(existsSync(join(tableRoot, file))).toBe(true);
      }
    }

    for (const domain of [
      "admin-foundations",
      "foundation-requests",
      "trustee-reviews",
    ]) {
      expect(existsSync(join(tablesRoot, domain, "action-menu.tsx"))).toBe(
        true,
      );
    }
  });

  test("framework route handlers remain the only web Prisma exceptions", () => {
    const prismaImports = productionAppFiles
      .filter((path) => readSource(path).includes("@al-infaaq/db"))
      .map((path) => relative(appRoot, path))
      .sort();

    expect(prismaImports).toEqual([
      "api/payments/_shared.ts",
      "api/requests/[id]/banner/route.ts",
    ]);
  });

  test("payment route handlers are webhook-only", () => {
    const paymentRouteFiles = productionAppFiles
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
