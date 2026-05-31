import { defineConfig, devices } from "@playwright/test";

const webPort = Number(process.env.E2E_WEB_PORT ?? "3901");
const apiPort = Number(process.env.E2E_API_PORT ?? "3902");
const paymentPort = Number(process.env.E2E_PAYMENT_PORT ?? "3903");
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${webPort}`;
const paymentBaseURL = `http://localhost:${paymentPort}`;

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: [["list"]],
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "bun run scripts/e2e-payment-provider.ts",
      env: {
        E2E_PAYMENT_PORT: String(paymentPort),
        WEB_APP_URL: baseURL,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: `${paymentBaseURL}/health`,
    },
    {
      command:
        "node ./scripts/with-workspace-env.mjs bun run scripts/e2e-api-server.ts",
      env: {
        API_PORT: String(apiPort),
        LEMON_SQUEEZY_BASE_URL: paymentBaseURL,
        LEMONSQUEEZY_API_KEY: "e2e-lemonsqueezy-key",
        LEMONSQUEEZY_DONATION_VARIANT_ID: "1",
        LEMONSQUEEZY_STORE_ID: "1",
        LEMONSQUEEZY_WEBHOOK_SECRET: "e2e-lemonsqueezy-webhook-secret",
        NEXT_PUBLIC_API_URL: `http://localhost:${apiPort}`,
        PAYSTACK_BASE_URL: paymentBaseURL,
        PAYSTACK_SECRET_KEY: "e2e-paystack-secret",
        WEB_APP_URL: baseURL,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: `http://localhost:${apiPort}/health`,
    },
    {
      command: `node ./scripts/with-workspace-env.mjs bun run --cwd apps/web start -- -p ${webPort}`,
      env: {
        API_PORT: String(apiPort),
        LEMON_SQUEEZY_BASE_URL: paymentBaseURL,
        LEMONSQUEEZY_API_KEY: "e2e-lemonsqueezy-key",
        LEMONSQUEEZY_DONATION_VARIANT_ID: "1",
        LEMONSQUEEZY_STORE_ID: "1",
        LEMONSQUEEZY_WEBHOOK_SECRET: "e2e-lemonsqueezy-webhook-secret",
        NEXT_PUBLIC_API_URL: `http://localhost:${apiPort}`,
        PAYSTACK_BASE_URL: paymentBaseURL,
        PAYSTACK_SECRET_KEY: "e2e-paystack-secret",
        WEB_APP_URL: baseURL,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: baseURL,
    },
  ],
});
