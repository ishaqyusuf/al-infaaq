import { afterEach, describe, expect, test } from "bun:test";

import { resolveApiUrl, resolveAppUrl } from "./runtime-url";

const originalEnv = { ...process.env };
const originalWindow = globalThis.window;

function resetRuntime() {
  process.env = { ...originalEnv };

  if (originalWindow) {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
    return;
  }

  Reflect.deleteProperty(globalThis, "window");
}

function mockBrowserOrigin(origin: string) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        origin,
      },
    },
  });
}

describe("runtime URL resolution", () => {
  afterEach(() => {
    resetRuntime();
  });

  test("resolves web app origins from public or server env with normalized trailing slash", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://alinfaaq.test/";

    expect(resolveAppUrl()).toBe("https://alinfaaq.test");

    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.WEB_APP_URL = "https://web.alinfaaq.test///";

    expect(resolveAppUrl()).toBe("https://web.alinfaaq.test");
  });

  test("resolves API origins from public, server, or Better Auth env", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.alinfaaq.test/";

    expect(resolveApiUrl()).toBe("https://api.alinfaaq.test");

    delete process.env.NEXT_PUBLIC_API_URL;
    process.env.API_ORIGIN = "https://hono.alinfaaq.test/";

    expect(resolveApiUrl()).toBe("https://hono.alinfaaq.test");

    delete process.env.API_ORIGIN;
    process.env.BETTER_AUTH_URL = "https://auth.alinfaaq.test/";

    expect(resolveApiUrl()).toBe("https://auth.alinfaaq.test");
  });

  test("uses browser origin for proxy or portless deployments without explicit API env", () => {
    mockBrowserOrigin("https://preview.alinfaaq.test");

    expect(resolveApiUrl()).toBe("https://preview.alinfaaq.test");
  });

  test("normalizes Vercel origins and keeps local fallbacks", () => {
    process.env.VERCEL_URL = "alinfaaq-preview.vercel.app";

    expect(resolveAppUrl()).toBe("https://alinfaaq-preview.vercel.app");

    delete process.env.VERCEL_URL;

    expect(resolveAppUrl()).toBe("http://localhost:3000");
    expect(resolveApiUrl()).toBe("http://localhost:3902");
  });
});
