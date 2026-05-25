"use client";

import { Button } from "@al-infaaq/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const response = await authClient.signIn.email({
      email,
      password,
    });

    setIsPending(false);

    if (response.error) {
      setError(response.error.message ?? "Unable to sign in.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-stone-800">
          Email
          <input
            autoComplete="email"
            className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-800">
          Password
          <input
            autoComplete="current-password"
            className="h-11 rounded-md border border-stone-300 px-3 text-base outline-none focus:border-emerald-700"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
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
