import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const appRoot = join(import.meta.dir, "app");
const repoRoot = join(import.meta.dir, "../../..");
const uiRoot = join(repoRoot, "packages", "ui", "src");

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
const uiFiles = walkFiles(uiRoot).filter((path) => /\.(ts|tsx)$/.test(path));
const productionAppFiles = appFiles.filter(
  (path) => !path.endsWith(".test.ts"),
);
const productionUiFiles = uiFiles.filter((path) => !path.endsWith(".test.ts"));

const protectedRouteRoleExpectations = {
  "admin/page.tsx": 'requireRole(["admin"])',
  "donate/page.tsx": 'requireRole(["spender", "admin"])',
  "foundation/requests/[id]/banner/page.tsx":
    'requireRole(["foundation", "admin"])',
  "foundation/requests/[id]/report/page.tsx":
    'requireRole(["foundation", "admin"])',
  "foundation/requests/page.tsx": 'requireRole(["foundation", "admin"])',
  "foundations/apply/page.tsx": 'requireRole(["spender", "foundation"])',
  "goals/page.tsx": 'requireRole(["spender", "admin"])',
  "trustee/reviews/page.tsx": 'requireRole(["trustee", "admin"])',
  "wallet/page.tsx": 'requireRole(["spender", "admin"])',
} as const;

const launchEnvVars = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_API_URL",
  "WEB_APP_URL",
  "API_ORIGIN",
  "API_PORT",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "AL_INFAAQ_ADMIN_EMAILS",
  "AL_INFAAQ_TRUSTEE_EMAILS",
  "DATABASE_PROVIDER",
  "DATABASE_URL",
  "PAYSTACK_PUBLIC_KEY",
  "PAYSTACK_SECRET_KEY",
  "PAYSTACK_WEBHOOK_SECRET",
  "LEMONSQUEEZY_API_KEY",
  "LEMONSQUEEZY_DONATION_VARIANT_ID",
  "LEMONSQUEEZY_STORE_ID",
  "LEMONSQUEEZY_WEBHOOK_SECRET",
] as const;

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

  test("public product copy uses Trustee-reviewed foundation language", () => {
    const offenders = productionAppFiles.filter((path) =>
      /verified foundations/i.test(readSource(path)),
    );

    expect(offenders.map((path) => relative(appRoot, path))).toEqual([]);
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

  test("protected web routes declare the expected role boundaries", () => {
    for (const [route, roleCheck] of Object.entries(
      protectedRouteRoleExpectations,
    )) {
      const source = readSource(join(appRoot, route));

      expect(source).toContain('from "@/lib/server-auth"');
      expect(source).toContain(roleCheck);
    }

    const dashboardSource = readSource(join(appRoot, "dashboard", "page.tsx"));

    expect(dashboardSource).toContain("requireServerAuthSession()");
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

  test("public homepage controls link to real workflows", () => {
    const source = readSource(join(appRoot, "page.tsx"));

    expect(source).not.toContain('type="button"');
    expect(source).toContain('href="/wallet"');
    expect(source).toContain('href="/foundation/requests"');
    expect(source).toContain('href="/requests"');
  });

  test("app and shared UI classes use valid Tailwind color shade steps", () => {
    const invalidShadePattern =
      /(?:bg|text|border|ring|from|via|to|decoration|accent|caret|fill|stroke|outline)-(?:stone|emerald|red|amber|sky|rose|violet|gold)-(?:150|250|350|450|550|650|750|850)(?:\b|\/)/;
    const offenders = [...productionAppFiles, ...productionUiFiles].filter(
      (path) => invalidShadePattern.test(readSource(path)),
    );

    expect(
      offenders.map((path) =>
        path.startsWith(appRoot)
          ? relative(appRoot, path)
          : relative(repoRoot, path),
      ),
    ).toEqual([]);
  });

  test("app pages use design tokens for page-level backgrounds", () => {
    const offenders = productionAppFiles
      .filter((path) => path.endsWith(".tsx"))
      .filter((path) => /bg-\[#[0-9a-fA-F]{3,8}\]/.test(readSource(path)));

    expect(offenders.map((path) => relative(appRoot, path))).toEqual([]);
  });

  test("app and shared UI avoid oversized card corner radii", () => {
    const oversizedRadiusPattern = /rounded-(?:xl|2xl|3xl)/;
    const offenders = [...productionAppFiles, ...productionUiFiles].filter(
      (path) => oversizedRadiusPattern.test(readSource(path)),
    );

    expect(
      offenders.map((path) =>
        path.startsWith(appRoot)
          ? relative(appRoot, path)
          : relative(repoRoot, path),
      ),
    ).toEqual([]);
  });

  test("app command links use shared button variants instead of one-off classes", () => {
    const oneOffCommandPattern =
      /className="[^"]*inline-flex[^"]*h-(?:9|10|11)[^"]*rounded-md[^"]*(?:bg-stone-950|border border-stone-300)[^"]*"/;
    const offenders = productionAppFiles.filter((path) =>
      oneOffCommandPattern.test(readSource(path)),
    );

    expect(offenders.map((path) => relative(appRoot, path))).toEqual([]);
  });

  test("launch environment contract stays templated and documented", () => {
    const sources = {
      ".env.example": readSource(join(repoRoot, ".env.example")),
      "README.md": readSource(join(repoRoot, "README.md")),
      "docs/deployment.md": readSource(join(repoRoot, "docs", "deployment.md")),
      "brain/system/launch-readiness.md": readSource(
        join(repoRoot, "brain", "system", "launch-readiness.md"),
      ),
    };
    const missing = Object.entries(sources).flatMap(([sourceName, source]) =>
      launchEnvVars
        .filter((envVar) => !source.includes(envVar))
        .map((envVar) => `${sourceName}: ${envVar}`),
    );

    expect(missing).toEqual([]);
  });
});
