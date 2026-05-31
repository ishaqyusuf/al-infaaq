import { Badge } from "@al-infaaq/ui/badge";
import { buttonVariants } from "@al-infaaq/ui/button";
import { PremiumCard } from "@al-infaaq/ui/card";
import {
  ArrowRight,
  BadgeCheck,
  EyeOff,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

const workflowLinks = [
  {
    description: "Browse Trustee-reviewed requests and give anonymously.",
    href: "/requests",
    title: "Donate",
  },
  {
    description: "Submit a foundation profile for Trustee review.",
    href: "/foundations/apply",
    title: "Apply",
  },
  {
    description: "Manage published requests and fundraising banners.",
    href: "/foundation/requests",
    title: "Publish",
  },
];

const verificationQueue = [
  "Foundation profile submitted",
  "Documents reviewed by admin",
  "Trustee assigned",
  "Approval decision recorded",
];

const providerStatus = [
  {
    color: "bg-emerald-100 text-emerald-900",
    name: "Paystack",
    status: "Donation collections",
  },
  {
    color: "bg-violet-100 text-violet-900",
    name: "Lemon Squeezy",
    status: "Global checkout",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-stone-950 text-white">
              <HeartHandshake aria-hidden="true" className="size-6" />
            </div>
            <div>
              <p className="text-xl font-semibold">Al-Infaaq</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Anonymous sadaqah operations
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {providerStatus.map((provider) => (
              <Badge className={provider.color} key={provider.name}>
                {provider.name}: {provider.status}
              </Badge>
            ))}
            <Link
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href="/requests"
            >
              Browse requests
            </Link>
            <Link
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href="/sign-in"
            >
              Sign in
            </Link>
            <Link className={buttonVariants({ size: "sm" })} href="/sign-up">
              Create account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1.3fr_0.7fr]">
        <PremiumCard className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-950 dark:text-emerald-300 border border-emerald-200/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <ShieldCheck
                  aria-hidden="true"
                  className="size-3.5 text-emerald-700 dark:text-emerald-500"
                />
                Trustee-reviewed foundations
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl dark:text-stone-50">
                Spend quietly. Verify carefully. Move sadaqah faster.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-stone-600 dark:text-stone-400">
                Al-Muhsinoon set private monthly goals, Trustee-reviewed
                foundations publish real needs, and trusted Trustee accounts
                approve foundations before they receive public donations.
              </p>
            </div>
            <div className="grid min-w-64 gap-3 rounded-lg border border-stone-200 dark:border-stone-800/50 bg-white/70 dark:bg-stone-900/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Start here
              </p>
              <Link
                className={buttonVariants({ variant: "secondary" })}
                href="/requests"
              >
                Browse requests
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                className={buttonVariants({ variant: "outline" })}
                href="/goals"
              >
                Set giving goal
              </Link>
              <Link
                className={buttonVariants({ variant: "outline" })}
                href="/foundations/apply"
              >
                Submit foundation
              </Link>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="bg-stone-950 dark:bg-stone-900/50 p-6 text-white overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  Privacy mode
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  History hidden
                </h2>
              </div>
              <EyeOff
                aria-hidden="true"
                className="size-6 text-amber-300 status-glow"
              />
            </div>
            <p className="mt-5 text-sm leading-6 text-stone-300">
              Spenders can hide personal history in the dashboard while the
              platform still keeps private records for receipts, reconciliation,
              and fraud protection.
            </p>
          </div>
          <Link
            className={buttonVariants({
              className: "mt-6 w-full sm:w-auto",
              variant: "secondary",
            })}
            href="/wallet"
          >
            <WalletCards aria-hidden="true" className="size-4" />
            Open giving wallet
          </Link>
        </PremiumCard>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-6 sm:px-8 xl:grid-cols-[0.8fr_1.2fr]">
        <PremiumCard className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
                Foundation review
              </p>
              <h2 className="text-2xl font-bold tracking-tight">
                Trustee approval flow
              </h2>
            </div>
            <BadgeCheck
              aria-hidden="true"
              className="size-6 text-sky-700 dark:text-sky-500"
            />
          </div>
          <div className="grid gap-3">
            {verificationQueue.map((item, index) => (
              <div
                className="flex items-center gap-3 rounded-lg border border-stone-200 dark:border-stone-800/50 p-3.5 transition-colors hover:bg-stone-50 dark:bg-stone-900/50 dark:hover:bg-stone-900/30"
                key={item}
              >
                <div className="grid size-8 place-items-center rounded-lg bg-sky-50 text-sm font-semibold text-sky-900 dark:bg-sky-950/45 dark:text-sky-300">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard className="p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
                Working surfaces
              </p>
              <h2 className="text-2xl font-bold tracking-tight">
                Foundation spending needs
              </h2>
            </div>
            <Link
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href="/foundation/requests"
            >
              <Sparkles
                aria-hidden="true"
                className="size-4 text-emerald-600 dark:text-emerald-400"
              />
              Generate banner
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {workflowLinks.map((workflow) => (
              <Link
                className="interactive-card rounded-lg border border-stone-200 dark:border-stone-800/60 bg-white dark:bg-stone-900/30 p-4"
                href={workflow.href}
                key={workflow.title}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold tracking-tight leading-snug">
                      {workflow.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
                      {workflow.description}
                    </p>
                  </div>
                  <ArrowRight
                    aria-hidden="true"
                    className="mt-1 size-4 text-emerald-700 dark:text-emerald-500"
                  />
                </div>
              </Link>
            ))}
          </div>
        </PremiumCard>
      </section>
    </main>
  );
}
