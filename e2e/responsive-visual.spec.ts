import { expect, type Page, test } from "@playwright/test";

const viewports = [
  { height: 844, label: "mobile", width: 390 },
  { height: 900, label: "desktop", width: 1440 },
] as const;

const publicSurfaces = [
  {
    heading: /spend quietly/i,
    label: "home",
    path: "/",
    primaryControl: "Browse requests",
  },
  {
    heading: "Foundation spending needs",
    label: "request discovery",
    path: "/requests",
    primaryControl: "Donor identity stays private.",
  },
  {
    heading: "Sign in",
    label: "sign in",
    path: "/sign-in",
    primaryControl: "Email",
  },
  {
    heading: "Create account",
    label: "sign up",
    path: "/sign-up",
    primaryControl: "Email",
  },
] as const;

async function assertNoPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const rootOverflow = root.scrollWidth - root.clientWidth;
    const bodyOverflow = body.scrollWidth - body.clientWidth;

    return Math.max(rootOverflow, bodyOverflow);
  });

  expect(overflow).toBeLessThanOrEqual(1);
}

async function assertVisibleTextHasBox(page: Page) {
  const collapsedText = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll<HTMLElement>("h1,h2,h3,p,a,button,label"),
    )
      .filter((element) => {
        const text = element.innerText.trim();
        const box = element.getBoundingClientRect();

        return text.length > 0 && box.width < 2 && box.height < 2;
      })
      .map((element) => element.innerText.trim())
      .slice(0, 5),
  );

  expect(collapsedText).toEqual([]);
}

for (const viewport of viewports) {
  test.describe(`responsive public surfaces at ${viewport.label}`, () => {
    test.use({
      viewport: {
        height: viewport.height,
        width: viewport.width,
      },
    });

    for (const surface of publicSurfaces) {
      test(`${surface.label} has stable layout and visible primary content`, async ({
        page,
      }) => {
        await page.goto(surface.path);
        await expect(page.locator("html")).toHaveClass(/dark/);
        await expect(
          page.getByRole("heading", { name: surface.heading }),
        ).toBeVisible();
        await expect(
          page.getByText(surface.primaryControl).first(),
        ).toBeVisible();

        await assertNoPageOverflow(page);
        await assertVisibleTextHasBox(page);
      });
    }
  });
}
