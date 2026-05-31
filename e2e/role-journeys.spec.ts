import { execFileSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import { type Browser, expect, type Page, test } from "@playwright/test";

const repoRoot = process.cwd();
const password = "Alinfaaq-e2e-123";
const runId = `${process.env.E2E_RUN_ID ?? Date.now()}-${randomUUID()}`;
const foundationName = `E2E Amanah Foundation ${runId}`;
const requestTitle = `E2E Emergency Relief ${runId}`;
const restrictedFoundation = {
  email: `restricted-foundation-${runId}@alinfaaq.test`,
  name: "E2E Restricted Foundation",
  role: "foundation",
} as const;

const roleJourneys = [
  {
    email: `spender-${runId}@alinfaaq.test`,
    expectedHeading: "Monthly sadaqah goal",
    expectedPath: "/goals",
    name: "E2E Spender",
    role: "spender",
  },
  {
    email: `foundation-${runId}@alinfaaq.test`,
    expectedHeading: "Trustee review submission",
    expectedPath: "/foundations/apply",
    name: "E2E Foundation",
    role: "foundation",
  },
  {
    email: `trustee-${runId}@alinfaaq.test`,
    expectedHeading: "E2E Trustee",
    expectedPath: "/dashboard",
    name: "E2E Trustee",
    workspaceHeading: "Foundation queue",
    workspacePath: "/trustee/reviews",
    role: "trustee",
  },
  {
    email: `admin-${runId}@alinfaaq.test`,
    expectedHeading: "E2E Admin",
    expectedPath: "/dashboard",
    name: "E2E Admin",
    workspaceHeading: "Operations dashboard",
    workspacePath: "/admin",
    role: "admin",
  },
] as const;

async function createAccount(browser: Browser, email: string, name: string) {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL(/\/(dashboard|goals)/);
  await context.close();
}

function promoteUser(email: string, role: string) {
  execFileSync("bun", ["run", "e2e/promote-user.ts", email, role], {
    cwd: repoRoot,
    env: process.env,
    stdio: "inherit",
  });
}

async function signIn(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function signInFresh(page: Page, email: string) {
  await page.context().clearCookies();
  await signIn(page, email);
}

function signLemonPayload(payload: string) {
  return createHmac(
    "sha256",
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET ??
      "e2e-lemonsqueezy-webhook-secret",
  )
    .update(payload)
    .digest("hex");
}

test.describe("role onboarding journeys", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(180_000);

    for (const journey of roleJourneys) {
      await createAccount(browser, journey.email, journey.name);
      promoteUser(journey.email, journey.role);
    }

    await createAccount(
      browser,
      restrictedFoundation.email,
      restrictedFoundation.name,
    );
    promoteUser(restrictedFoundation.email, restrictedFoundation.role);
  });

  for (const journey of roleJourneys) {
    test(`${journey.role} signs in and lands in the correct workspace`, async ({
      page,
    }) => {
      await signIn(page, journey.email);

      await page.waitForURL(`**${journey.expectedPath}`);
      await expect(
        page.getByRole("heading", { name: journey.expectedHeading }),
      ).toBeVisible();

      if ("workspacePath" in journey) {
        await page.getByRole("link", { name: "Open" }).click();
        await page.waitForURL(`**${journey.workspacePath}`);
        await expect(
          page.getByRole("heading", { name: journey.workspaceHeading }),
        ).toBeVisible();
      }
    });
  }

  test("spender saves a private monthly giving goal through tRPC", async ({
    page,
  }) => {
    const spender = roleJourneys.find((journey) => journey.role === "spender");

    if (!spender) {
      throw new Error("Spender journey fixture missing.");
    }

    await signIn(page, spender.email);
    await page.waitForURL("**/goals");

    await page.getByLabel("Monthly goal in NGN").fill("75000");
    await page.getByLabel("Reminder channel").selectOption("EMAIL");
    await page.getByLabel("Send monthly giving reminders").check();
    await page.getByLabel("Show private giving history in wallet").check();
    await page.getByRole("button", { name: "Save goal" }).click();

    await expect(page.getByText("of ₦75,000")).toBeVisible();
    await expect(page.getByText("Next reminder: Paused")).toBeHidden();

    await page.getByLabel("Send monthly giving reminders").uncheck();
    await page.getByRole("button", { name: "Save goal" }).click();

    await expect(page.getByText("of ₦75,000")).toBeVisible();
    await expect(page.getByText("Next reminder: Paused")).toBeVisible();
  });

  test("foundation submits its profile for Trustee review through tRPC", async ({
    page,
  }) => {
    const foundation = roleJourneys.find(
      (journey) => journey.role === "foundation",
    );

    if (!foundation) {
      throw new Error("Foundation journey fixture missing.");
    }

    await signIn(page, foundation.email);
    await page.waitForURL("**/foundations/apply");

    await page.getByLabel("Foundation name").fill(foundationName);
    await page
      .getByLabel("Description")
      .fill("A test foundation profile submitted through the browser.");
    await page.getByLabel("Contact email").fill(foundation.email);
    await page.getByLabel("Registration number").fill("E2E-TRUST-001");
    await page.getByLabel("Website URL").fill("https://alinfaaq.test");
    await page
      .getByLabel("Document URL")
      .fill("https://alinfaaq.test/documents/foundation.pdf");
    await page
      .getByRole("button", { name: "Submit for Trustee review" })
      .click();

    await expect(page.getByText("PENDING REVIEW")).toBeVisible();
  });

  test("Trustee approval unlocks foundation request publishing and banners", async ({
    page,
  }) => {
    const foundation = roleJourneys.find(
      (journey) => journey.role === "foundation",
    );
    const trustee = roleJourneys.find((journey) => journey.role === "trustee");

    if (!foundation || !trustee) {
      throw new Error("Foundation or Trustee journey fixture missing.");
    }

    await signInFresh(page, trustee.email);
    await page.waitForURL("**/dashboard");
    await page.goto("/trustee/reviews");

    await expect(page.getByText(foundationName)).toBeVisible();
    const approveResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/trpc/trustee.approveReview") &&
        response.request().method() === "POST",
    );
    await page
      .locator(
        `xpath=//p[normalize-space()="${foundationName}"]/ancestor::div[contains(@class,"border-b")]/following-sibling::div[4]//button[normalize-space()="Approve"]`,
      )
      .click();
    expect((await approveResponse).ok()).toBe(true);

    await signInFresh(page, foundation.email);
    await page.waitForURL("**/dashboard");
    await page.goto("/foundation/requests");

    await page.getByLabel("Title").fill(requestTitle);
    await page
      .getByLabel("Story")
      .fill("A browser-created request for a Trustee-approved foundation.");
    await page.getByLabel("Target amount in NGN").fill("150000");
    const createResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/trpc/requests.create") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Create draft" }).click();
    expect((await createResponse).ok()).toBe(true);
    await page.reload();

    await expect(page.getByText(requestTitle)).toBeVisible();
    const publishResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/trpc/requests.publish") &&
        response.request().method() === "POST",
    );
    await page
      .locator(
        `xpath=//p[normalize-space()="${requestTitle}"]/ancestor::div[contains(@class,"border-b")]/following-sibling::div[5]//button[normalize-space()="Publish"]`,
      )
      .click();
    expect((await publishResponse).ok()).toBe(true);
    await page.reload();
    await expect(page.getByText("published")).toBeVisible();

    await page
      .locator(
        `xpath=//p[normalize-space()="${requestTitle}"]/ancestor::div[contains(@class,"border-b")]/following-sibling::div[5]//a[normalize-space()="Public page"]`,
      )
      .click();
    await page.waitForURL("**/requests/**");
    await expect(
      page.getByRole("heading", { name: requestTitle }),
    ).toBeVisible();
    await expect(page.getByText("Trustee-reviewed foundation")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Donate anonymously" }),
    ).toBeVisible();

    await page.goBack();
    await page
      .locator(
        `xpath=//p[normalize-space()="${requestTitle}"]/ancestor::div[contains(@class,"border-b")]/following-sibling::div[5]//a[normalize-space()="Banner"]`,
      )
      .click();
    await expect(
      page.getByRole("heading", { name: requestTitle }),
    ).toBeVisible();
    const bannerResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/trpc/requests.generateBanner") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Generate banner" }).click();
    expect((await bannerResponse).ok()).toBe(true);
    await page.reload();
    await expect(
      page.getByRole("link", { name: "Download banner" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open request" }),
    ).toBeVisible();
  });

  test("spender completes anonymous Paystack donation checkout", async ({
    page,
  }) => {
    const spender = roleJourneys.find((journey) => journey.role === "spender");

    if (!spender) {
      throw new Error("Spender journey fixture missing.");
    }

    await signInFresh(page, spender.email);
    await page.waitForURL("**/dashboard");
    await page.goto("/requests");
    await page.getByText(requestTitle).click();
    await page.waitForURL("**/requests/**");
    await page.getByRole("link", { name: "Donate anonymously" }).click();
    await page.waitForURL("**/donate?requestId=*");

    await page.getByLabel("Amount in NGN").fill("25");
    await page.getByLabel("Payment provider").selectOption("paystack");
    const checkoutResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/trpc/donations.start") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Continue to payment" }).click();
    expect((await checkoutResponse).ok()).toBe(true);

    await page.waitForURL("**/donations/complete?reference=*");
    await expect(
      page.getByRole("heading", { name: "Donation recorded successfully." }),
    ).toBeVisible();

    await page.goto("/wallet");
    await expect(
      page.getByRole("heading", { name: "₦25 recorded" }),
    ).toBeVisible();
    await expect(page.getByText(requestTitle)).toBeVisible();
    await expect(page.getByText("succeeded")).toBeVisible();
  });

  test("spender completes anonymous Lemon Squeezy donation by webhook", async ({
    page,
    request,
  }) => {
    const spender = roleJourneys.find((journey) => journey.role === "spender");

    if (!spender) {
      throw new Error("Spender journey fixture missing.");
    }

    await signInFresh(page, spender.email);
    await page.waitForURL("**/dashboard");
    await page.goto("/requests");
    await page.getByText(requestTitle).click();
    await page.waitForURL("**/requests/**");
    await page.getByRole("link", { name: "Donate anonymously" }).click();
    await page.waitForURL("**/donate?requestId=*");

    await page.getByLabel("Amount in NGN").fill("30");
    await page.getByLabel("Payment provider").selectOption("lemon_squeezy");
    const checkoutResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/trpc/donations.start") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Continue to payment" }).click();
    expect((await checkoutResponse).ok()).toBe(true);

    await page.waitForURL("**/wallet?provider=lemon_squeezy&reference=*");
    const reference = new URL(page.url()).searchParams.get("reference");

    if (!reference) {
      throw new Error("Lemon Squeezy checkout reference missing.");
    }

    const payload = JSON.stringify({
      meta: {
        custom_data: {
          donation_reference: reference,
        },
        event_name: "order_created",
      },
    });
    const webhookResponse = await request.post(
      "/api/payments/lemonsqueezy/webhook",
      {
        data: payload,
        headers: {
          "content-type": "application/json",
          "x-signature": signLemonPayload(payload),
        },
      },
    );
    expect(webhookResponse.ok()).toBe(true);

    await page.goto("/wallet");
    await expect(
      page.getByRole("heading", { name: "₦55 recorded" }),
    ).toBeVisible();
    await expect(page.getByText(requestTitle).first()).toBeVisible();
    await expect(page.getByText("succeeded").first()).toBeVisible();
  });

  test("admin sees payout readiness and trust operations", async ({ page }) => {
    const admin = roleJourneys.find((journey) => journey.role === "admin");

    if (!admin) {
      throw new Error("Admin journey fixture missing.");
    }

    await signInFresh(page, admin.email);
    await page.waitForURL("**/dashboard");
    await page.goto("/admin");

    await expect(
      page.getByRole("heading", { name: "Payout readiness" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Trust operations" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Incident review" }),
    ).toBeVisible();
    await expect(page.getByText("Stale pending donations")).toBeVisible();
    await expect(page.getByText("High-value successful gifts")).toBeVisible();
    await expect(
      page.getByText("Support queue for suspended foundations", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(page.getByText(requestTitle).first()).toBeVisible();
  });

  test("foundation opens privacy-safe request impact report", async ({
    page,
  }) => {
    const foundation = roleJourneys.find(
      (journey) => journey.role === "foundation",
    );

    if (!foundation) {
      throw new Error("Foundation journey fixture missing.");
    }

    await signInFresh(page, foundation.email);
    await page.waitForURL("**/dashboard");
    await page.goto("/foundation/requests");
    await page
      .locator(
        `xpath=//p[normalize-space()="${requestTitle}"]/ancestor::div[contains(@class,"border-b")]/following-sibling::div[5]//a[normalize-space()="Report"]`,
      )
      .click();
    await page.waitForURL("**/foundation/requests/**/report");

    await expect(
      page.getByRole("heading", { name: requestTitle }),
    ).toBeVisible();
    await expect(page.getByText("Privacy-safe impact report")).toBeVisible();
    await expect(page.getByText("Donation status mix")).toBeVisible();
    await expect(page.getByText("Operational notes")).toBeVisible();
    await expect(page.getByText("₦55").first()).toBeVisible();
    await expect(page.getByText("2 records")).toBeVisible();
    await expect(page.getByText("donor names", { exact: false })).toBeVisible();
  });

  test("foundation users are redirected away from admin operations", async ({
    page,
  }) => {
    await signIn(page, restrictedFoundation.email);
    await page.waitForURL("**/foundations/apply");

    await page.goto("/admin");
    await page.waitForURL("**/foundations/apply");
    await expect(
      page.getByRole("heading", { name: "Trustee review submission" }),
    ).toBeVisible();
  });
});
