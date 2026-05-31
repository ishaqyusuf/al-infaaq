"use client";

type QuickFillValues = Record<string, unknown>;

export type QuickFillProfile =
  | "auth-sign-up"
  | "auth-sign-in-admin"
  | "auth-sign-in-foundation"
  | "auth-sign-in-spender"
  | "auth-sign-in-trustee"
  | "donation"
  | "foundation-review"
  | "generic"
  | "giving-goal"
  | "request";

export type QuickFillFormAdapter<
  TValues extends QuickFillValues = QuickFillValues,
> = {
  getValues: () => TValues;
  reset: (values: TValues | QuickFillValues) => void;
  setValue: (
    name: string,
    value: unknown,
    options?: {
      shouldDirty?: boolean;
      shouldTouch?: boolean;
      shouldValidate?: boolean;
    },
  ) => void;
};

export const DEV_AUTH_ACCOUNTS = [
  {
    email: "admin@alinfaaq.test",
    label: "Super admin",
    name: "Al-Infaaq Admin",
    password: "Alinfaaq-dev-123",
    profile: "auth-sign-in-admin",
  },
  {
    email: "spender@alinfaaq.test",
    label: "Al-Muhsin",
    name: "Amina Yusuf",
    password: "Alinfaaq-dev-123",
    profile: "auth-sign-in-spender",
  },
  {
    email: "foundation@alinfaaq.test",
    label: "Foundation",
    name: "Barakah Foundation",
    password: "Alinfaaq-dev-123",
    profile: "auth-sign-in-foundation",
  },
  {
    email: "trustee@alinfaaq.test",
    label: "Trustee",
    name: "Trustee Reviewer",
    password: "Alinfaaq-dev-123",
    profile: "auth-sign-in-trustee",
  },
] as const;

function randomId() {
  return Math.random().toString(36).slice(2, 7);
}

export class QuickFill<TValues extends QuickFillValues = QuickFillValues> {
  private readonly id = randomId();

  constructor(private readonly form: QuickFillFormAdapter<TValues>) {}

  fill(profile: QuickFillProfile = "generic") {
    switch (profile) {
      case "auth-sign-up":
        return this.merge({
          email: `admin-${this.id}@alinfaaq.test`,
          name: "Al-Infaaq Admin",
          password: "Alinfaaq-dev-123",
        });
      case "auth-sign-in-admin":
      case "auth-sign-in-foundation":
      case "auth-sign-in-spender":
      case "auth-sign-in-trustee": {
        const account = DEV_AUTH_ACCOUNTS.find(
          (item) => item.profile === profile,
        );
        if (!account) {
          return;
        }
        return this.merge({
          email: account.email,
          password: account.password,
        });
      }
      case "donation":
        return this.merge({
          amountNaira: 25_000,
          provider: "paystack",
        });
      case "foundation-review":
        return this.merge({
          contactEmail: `foundation-${this.id}@alinfaaq.test`,
          description:
            "A Trustee-reviewed foundation supporting verified family relief, school fees, and urgent community requests.",
          documentUrl: "https://example.com/alinfaaq-foundation-docs.pdf",
          name: `Barakah Relief ${this.id.toUpperCase()}`,
          registrationNumber: `CAC-${this.id.toUpperCase()}`,
          websiteUrl: "https://example.com",
        });
      case "giving-goal":
        return this.merge({
          monthlyGoalNaira: 75_000,
          reminderChannel: "EMAIL",
          remindersEnabled: true,
          showSpendingHistory: true,
        });
      case "request":
        return this.merge({
          story:
            "This request funds urgent grocery and rent support for verified households while keeping donor identity private from the foundation.",
          targetNaira: 500_000,
          title: `Family relief request ${this.id.toUpperCase()}`,
        });
      case "generic":
        return this.generic();
    }
  }

  private generic() {
    const firstStringField = Object.entries(this.form.getValues()).find(
      ([, value]) => typeof value === "string",
    )?.[0];

    if (firstStringField) {
      this.set(firstStringField, "Al-Infaaq quick fill");
    }
  }

  private merge(values: QuickFillValues) {
    this.form.reset({
      ...(this.form.getValues() as QuickFillValues),
      ...values,
    });
  }

  private set(name: string, value: unknown) {
    this.form.setValue(name, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }
}

export function createQuickFillAdapter<
  TValues extends QuickFillValues = QuickFillValues,
>(form: {
  getValues: () => TValues;
  reset: (values: TValues | QuickFillValues) => void;
  setValue: (name: any, value: any, options?: any) => void;
}): QuickFillFormAdapter<TValues> {
  return {
    getValues: () => form.getValues(),
    reset: (values) => form.reset(values as TValues),
    setValue: (name, value, options) =>
      form.setValue(name as never, value as never, options),
  };
}
