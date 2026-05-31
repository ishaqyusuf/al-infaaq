"use client";

import { Button } from "@al-infaaq/ui/button";
import { Input } from "@al-infaaq/ui/input";
import { Label } from "@al-infaaq/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DevFormQuickFillButton } from "@/components/dev/dev-form-quick-fill-button";
import { createQuickFillAdapter, QuickFill } from "@/components/dev/quick-fill";
import { useZodForm } from "@/hooks/use-zod-form";
import { authClient } from "@/lib/auth-client";
import { type SignUpFormValues, signUpFormSchema } from "./sign-up-form.schema";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const form = useZodForm(signUpFormSchema, {
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
  });
  const quickFill = new QuickFill(createQuickFillAdapter(form));

  async function handleSubmit(values: SignUpFormValues) {
    setError(null);
    setIsPending(true);

    const response = await authClient.signUp.email({
      email: values.email,
      name: values.name,
      password: values.password,
    });

    setIsPending(false);

    if (response.error) {
      setError(response.error.message ?? "Unable to create account.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="mb-4 flex justify-end">
        <DevFormQuickFillButton onFill={() => quickFill.fill("auth-sign-up")} />
      </div>
      <div className="grid gap-4">
        <Label>
          Name
          <Input
            autoComplete="name"
            required
            type="text"
            {...form.register("name")}
          />
          {form.formState.errors.name?.message ? (
            <span className="text-xs font-normal text-red-700 dark:text-red-400">
              {form.formState.errors.name.message}
            </span>
          ) : null}
        </Label>
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
            autoComplete="new-password"
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
        {isPending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
