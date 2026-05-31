import { expect, test } from "@playwright/test";

test("public runtime surfaces render without database prerender failures", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(
    page.getByRole("heading", { name: /spend quietly/i }),
  ).toBeVisible();
  await expect(
    page.getByText("Trustee-reviewed foundations", { exact: true }),
  ).toBeVisible();

  await page.goto("/requests");
  await expect(
    page.getByRole("heading", { name: "Foundation spending needs" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Request discovery" }),
  ).toBeVisible();
  await expect(page.getByText(/public requests, \d+ funded\./)).toBeVisible();
  await expect(page.getByText("Donor identity stays private.")).toBeVisible();

  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();

  await page.goto("/not-a-real-route");
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { name: /spend quietly/i }),
  ).toBeVisible();
});
