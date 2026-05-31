import { describe, expect, mock, test } from "bun:test";
import { resolveRegisteredUserRole } from "./first-user-admin";

describe("first registered user admin", () => {
  test("promotes the first registered user to admin", async () => {
    await expect(
      resolveRegisteredUserRole({
        user: {
          count: mock(async () => 0),
        },
      }),
    ).resolves.toBe("ADMIN");
  });

  test("keeps later registered users as spenders", async () => {
    await expect(
      resolveRegisteredUserRole({
        user: {
          count: mock(async () => 3),
        },
      }),
    ).resolves.toBe("SPENDER");
  });
});
