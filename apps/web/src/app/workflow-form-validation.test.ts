import { describe, expect, test } from "bun:test";

import { parseDonationFormData } from "./donate/donation-form.schema";
import { parseFoundationReviewFormData } from "./foundations/apply/foundation-review-form.schema";
import { parseGivingGoalFormData } from "./goals/giving-goal-form.schema";

function formData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

describe("workflow form validation", () => {
  test("donation form accepts valid provider checkout input", () => {
    const result = parseDonationFormData(
      formData({
        amountNaira: "2500",
        provider: "paystack",
      }),
      "request-1",
    );

    expect(result).toEqual({
      data: {
        amountNaira: 2500,
        provider: "paystack",
        requestId: "request-1",
      },
      success: true,
    });
  });

  test("donation form rejects invalid amount and provider before tRPC mutation", () => {
    const result = parseDonationFormData(
      formData({
        amountNaira: "0",
        provider: "cash",
      }),
      "",
    );

    expect(result).toEqual({
      fieldErrors: {
        amountNaira: "Donation amount must be at least NGN 1.",
        provider: "Choose a payment provider.",
        requestId: "Choose a request to support.",
      },
      success: false,
    });
  });

  test("giving goal form accepts zero goals and reminder preferences", () => {
    const result = parseGivingGoalFormData(
      formData({
        monthlyGoalNaira: "0",
        reminderChannel: "EMAIL",
      }),
    );

    expect(result).toEqual({
      data: {
        monthlyGoalNaira: 0,
        reminderChannel: "EMAIL",
        remindersEnabled: false,
        showSpendingHistory: false,
      },
      success: true,
    });
  });

  test("giving goal form rejects negative goals and invalid channels", () => {
    const result = parseGivingGoalFormData(
      formData({
        monthlyGoalNaira: "-1",
        reminderChannel: "PUSH",
      }),
    );

    expect(result).toEqual({
      fieldErrors: {
        monthlyGoalNaira: "Monthly goal cannot be negative.",
        reminderChannel: "Choose a reminder channel.",
        remindersEnabled: undefined,
        showSpendingHistory: undefined,
      },
      success: false,
    });
  });

  test("foundation review form trims valid profile metadata", () => {
    const result = parseFoundationReviewFormData(
      formData({
        contactEmail: " apply@foundation.test ",
        description: " Food support ",
        documentUrl: "https://foundation.test/document.pdf",
        name: " Al Barakah Foundation ",
        registrationNumber: " CAC-123 ",
        websiteUrl: "https://foundation.test",
      }),
    );

    expect(result).toEqual({
      data: {
        contactEmail: "apply@foundation.test",
        description: "Food support",
        documentUrl: "https://foundation.test/document.pdf",
        name: "Al Barakah Foundation",
        registrationNumber: "CAC-123",
        websiteUrl: "https://foundation.test",
      },
      success: true,
    });
  });

  test("foundation review form rejects missing required fields and malformed links", () => {
    const result = parseFoundationReviewFormData(
      formData({
        contactEmail: "not-email",
        description: "",
        documentUrl: "foundation.test/document.pdf",
        name: "",
        registrationNumber: "",
        websiteUrl: "foundation.test",
      }),
    );

    expect(result).toEqual({
      fieldErrors: {
        contactEmail: "Enter a valid contact email.",
        description: "Describe the foundation's work.",
        documentUrl: "Enter a full URL, including https://.",
        name: "Enter the foundation name.",
        registrationNumber: undefined,
        websiteUrl: "Enter a full URL, including https://.",
      },
      success: false,
    });
  });
});
