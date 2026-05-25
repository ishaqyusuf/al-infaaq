import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/server-auth";
import { AuthForm } from "./sign-in-form";

export default async function SignInPage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen bg-[#f7f5ef] px-5 py-10 text-stone-950">
      <section className="mx-auto grid w-full max-w-md content-center">
        <div className="mb-8">
          <Link className="text-sm font-semibold text-emerald-800" href="/">
            Al-Infaaq
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Open your private giving, foundation, Trustee, or admin workspace.
          </p>
        </div>
        <AuthForm />
        <p className="mt-6 text-sm text-stone-600">
          New to Al-Infaaq?{" "}
          <Link className="font-semibold text-stone-950" href="/sign-up">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
