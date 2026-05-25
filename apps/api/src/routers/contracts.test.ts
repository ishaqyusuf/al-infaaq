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
      "requests",
      "trustee",
    ]) {
      expect(appRouterSource).toContain(`${routerName}:`);
    }
  });

  test("product routers use permission procedures for protected workflows", () => {
    const productRouterFiles = readdirSync(routersRoot)
      .filter((name) => name.endsWith(".route.ts"))
      .filter((name) => name !== "health.route.ts");

    for (const file of productRouterFiles) {
      const source = readRouter(file);

      expect(source).toContain("permissionProcedure");
    }
  });

  test("public request reads keep funded requests visible", () => {
    const source = readRouter("requests.route.ts");

    expect(source).toContain('in: ["PUBLISHED", "FUNDED"]');
  });

  test("banner generation is a stored tRPC workflow", () => {
    const source = readRouter("requests.route.ts");

    expect(source).toContain("generateBanner");
    expect(source).toContain("fundraisingBanner.create");
    expect(source).toContain("donation_request.banner_generated");
  });

  test("foundation workspace reports aggregate request performance only", () => {
    const source = readRouter("requests.route.ts");

    expect(source).toContain("statusCounts");
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
});
