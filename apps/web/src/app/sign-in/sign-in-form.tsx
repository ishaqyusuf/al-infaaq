"use client";

import { Button } from "@al-infaaq/ui/button";
import { Input } from "@al-infaaq/ui/input";
import { Label } from "@al-infaaq/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DevQuickLoginPanel } from "@/components/dev/dev-quick-login-panel";
import { createQuickFillAdapter, QuickFill } from "@/components/dev/quick-fill";
import { useZodForm } from "@/hooks/use-zod-form";
import { authClient } from "@/lib/auth-client";
import { type SignInFormValues, signInFormSchema } from "./sign-in-form.schema";

export function AuthForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const form = useZodForm(signInFormSchema, {
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const quickFill = new QuickFill(createQuickFillAdapter(form));

  async function signIn(values: SignInFormValues) {
    setError(null);
    setIsPending(true);

    const response = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    setIsPending(false);

    if (response.error) {
      setError(response.error.message ?? "Unable to sign in.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleQuickLogin(values: SignInFormValues) {
    quickFill.fill(
      values.email.includes("foundation")
        ? "auth-sign-in-foundation"
        : values.email.includes("trustee")
          ? "auth-sign-in-trustee"
          : values.email.includes("spender")
            ? "auth-sign-in-spender"
            : "auth-sign-in-admin",
    );
    await signIn(values);
  }

  return (
    <form
      className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950"
      onSubmit={form.handleSubmit(signIn)}
    >
      <div className="grid gap-4">
        <DevQuickLoginPanel onLogin={handleQuickLogin} />
        <Label>
          Email
          <Input
            autoComplete="email"
            required
            type="email"
            {...form.register("email")}
          />
          {form.formState.errors.email?.message ? (
            <span className="text-xs font-normal text-red-700 dark:text-red-400">
              {form.formState.errors.email.message}
            </span>
          ) : null}
        </Label>
        <Label>
          Password
          <Input
            autoComplete="current-password"
            minLength={8}
            required
            type="password"
            {...form.register("password")}
          />
          {form.formState.errors.password?.message ? (
            <span className="text-xs font-normal text-red-700 dark:text-red-400">
              {form.formState.errors.password.message}
            </span>
          ) : null}
        </Label>
      </div>
      {error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <Button className="mt-5 w-full" disabled={isPending} type="submit">
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
