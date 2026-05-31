import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const routersRoot = join(import.meta.dir);

function readRouter(name: string) {
  return readFileSync(join(routersRoot, name), "utf8");
}

describe("tRPC router contracts", () => {
  test("app router exposes product workflow routers", () => {
    const appRouterSource = readRouter("_app.ts");

    for (const routerName of [
      "admin",
      "donations",
      "foundations",
      "goals",
      "onboarding",
      "requests",
      "trustee",
    ]) {
      expect(appRouterSource).toContain(`${routerName}:`);
    }
  });

  test("product routers use protected procedures for protected workflows", () => {
    const productRouterFiles = readdirSync(routersRoot)
      .filter((name) => name.endsWith(".route.ts"))
      .filter((name) => name !== "health.route.ts");

    for (const file of productRouterFiles) {
      const source = readRouter(file);

      expect(
        source.includes("permissionProcedure") ||
          source.includes("protectedProcedure"),
      ).toBe(true);
    }
  });

  test("onboarding router owns profile-completion redirects", () => {
    const source = readRouter("onboarding.route.ts");

    expect(source).toContain("nextStep");
    expect(source).toContain("spenderProfile.findUnique");
    expect(source).toContain("foundation.findUnique");
    expect(source).toContain('href: "/goals"');
    expect(source).toContain('href: "/foundations/apply"');
  });

  test("public request reads keep funded requests visible", () => {
    const source = readRouter("requests.route.ts");

    expect(source).toContain('foundation: {\n            status: "APPROVED"');
    expect(source).toContain('in: ["PUBLISHED", "FUNDED"]');
  });

  test("request lifecycle blocks unapproved foundations from collecting", () => {
    const requestsSource = readRouter("requests.route.ts");
    const donationsSource = readRouter("donations.route.ts");

    expect(requestsSource).toContain('status: "APPROVED", userId');
    expect(requestsSource).toContain(
      "An approved foundation is required to create requests.",
    );
    expect(requestsSource).toContain(
      "Only approved foundations can publish requests.",
    );
    expect(requestsSource).toContain(
      "Only approved foundations can generate banners.",
    );
    expect(donationsSource).toContain(
      'foundation: {\n            status: "APPROVED"',
    );
    expect(donationsSource).toContain('status: "PUBLISHED"');
    expect(donationsSource).toContain("Donation request is not available.");
  });

  test("banner generation is a stored tRPC workflow", () => {
    const source = readRouter("requests.route.ts");

    expect(source).toContain("generateBanner");
    expect(source).toContain("fundraisingBanner.create");
    expect(source).toContain("donation_request.banner_generated");
  });

  test("foundation workspace reports aggregate request performance only", () => {
    const source = readRouter("requests.route.ts");

    expect(source).toContain("impactReport");
    expect(source).toContain("statusCounts");
    expect(source).toContain("statusTotalsKobo");
    expect(source).toContain("progressPercent");
    expect(source).not.toContain("spender: true");
  });

  test("donation checkout is the only provider initialization entrypoint", () => {
    const appRouterSource = readRouter("_app.ts");
    const donationsSource = readRouter("donations.route.ts");

    expect(appRouterSource).not.toContain("payments:");
    expect(donationsSource).toContain("initializePaystackTransaction");
    expect(donationsSource).toContain("createLemonSqueezyCheckout");
  });

  test("admin dashboard exposes payment reconciliation reporting", () => {
    const source = readRouter("admin.route.ts");

    expect(source).toContain("donationStatusCounts");
    expect(source).toContain("providerTotals");
    expect(source).toContain("reconciliationItems");
  });

  test("privileged Trustee and admin actions write audit logs", () => {
    const adminSource = readRouter("admin.route.ts");
    const trusteeSource = readRouter("trustee.route.ts");

    expect(adminSource).toContain("prisma.auditLog.create");
    expect(adminSource).toContain("foundation.restored");
    expect(adminSource).toContain("foundation.suspended");
    expect(trusteeSource).toContain("prisma.auditLog.create");
    expect(trusteeSource).toContain("foundation.trustee_review_approved");
    expect(trusteeSource).toContain("foundation.trustee_review_rejected");
  });
});
