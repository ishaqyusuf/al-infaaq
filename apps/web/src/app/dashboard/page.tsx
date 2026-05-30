import { Badge } from "@al-infaaq/ui/badge";
import { Card } from "@al-infaaq/ui/card";
import {
  Building2,
  ClipboardCheck,
  HeartHandshake,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireServerAuthSession } from "@/lib/server-auth";
import { createServerTrpcCaller } from "@/lib/trpc-server";
import { SignOutButton } from "./sign-out-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireServerAuthSession();
  const trpc = await createServerTrpcCaller();
  const nextAction = await trpc.onboarding.nextStep();

  if (!nextAction.complete) {
    redirect(nextAction.href);
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] dark:bg-[#11100d] text-stone-950 dark:text-stone-50">
      <section className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-stone-950 text-white">
              <HeartHandshake aria-hidden="true" className="size-6" />
            </div>
            <div>
              <Link className="text-xl font-semibold" href="/">
                Al-Infaaq
              </Link>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Private workspace
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[0.7fr_0.3fr]">
        <Card className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge className="bg-emerald-100 text-emerald-900">
                {session.user.roleLabel}
              </Badge>
              <h1 className="mt-4 text-3xl font-semibold">
                {session.user.name ?? session.user.email ?? "Welcome"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-400">
                Your role decides which workflows you can open. Foundation and
                Trustee access is intentionally assigned through controlled
                onboarding so collection approvals stay accountable.
              </p>
            </div>
            <Shield aria-hidden="true" className="size-8 text-emerald-700" />
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-500">
            Session
          </p>
          <p className="mt-3 break-words text-sm text-stone-700 dark:text-stone-300">
            {session.user.email ?? session.user.id}
          </p>
        </Card>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-6 sm:px-8 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start gap-3">
            <ClipboardCheck
              aria-hidden="true"
              className="mt-1 size-6 text-sky-700"
            />
            <div>
              <h2 className="text-xl font-semibold">{nextAction.label}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
                {nextAction.summary}
              </p>
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-semibold text-white"
                href={nextAction.href}
              >
                Open
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Building2
              aria-hidden="true"
              className="mt-1 size-6 text-amber-700"
            />
            <div>
              <h2 className="text-xl font-semibold">Trust boundary</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
                Public pages show foundation and request progress, never private
                spender identity fields.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
