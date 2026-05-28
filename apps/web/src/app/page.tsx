import { Badge } from "@al-infaaq/ui/badge";
import { Button } from "@al-infaaq/ui/button";
import { Card, PremiumCard } from "@al-infaaq/ui/card";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  EyeOff,
  FileCheck2,
  Goal,
  HeartHandshake,
  QrCode,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

const donationRequests = [
  {
    accent: "bg-emerald-500",
    foundation: "Baytul Khayr Foundation",
    progress: "60%",
    raised: "NGN 2.4m",
    target: "NGN 4m",
    title: "Ramadan food baskets",
  },
  {
    accent: "bg-sky-500",
    foundation: "Ansar Relief Trust",
    progress: "73%",
    raised: "NGN 880k",
    target: "NGN 1.2m",
    title: "Masjid borehole repair",
  },
  {
    accent: "bg-amber-500",
    foundation: "Amanah Care",
    progress: "57%",
    raised: "NGN 510k",
    target: "NGN 900k",
    title: "Widow rent support",
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
    <main className="min-h-screen bg-[#f7f5ef] text-stone-950">
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-stone-950 text-white">
              <HeartHandshake aria-hidden="true" className="size-6" />
            </div>
            <div>
              <p className="text-xl font-semibold">Al-Infaaq</p>
              <p className="text-sm text-stone-600">
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
              className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-3 text-sm font-semibold hover:bg-stone-50"
              href="/requests"
            >
              Browse requests
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-3 text-sm font-semibold hover:bg-stone-50"
              href="/sign-in"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md bg-stone-950 px-3 text-sm font-semibold text-white hover:bg-stone-800"
              href="/sign-up"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1.3fr_0.7fr]">
        <PremiumCard className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-950 dark:text-emerald-300 border border-emerald-250/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <ShieldCheck aria-hidden="true" className="size-3.5 text-emerald-700 dark:text-emerald-500" />
                Kitaab and Sunnah aligned giving
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl dark:text-stone-50">
                Spend quietly. Verify carefully. Move sadaqah faster.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-stone-600 dark:text-stone-400">
                Al-Muhsinoon set private monthly goals, verified foundations
                publish real needs, and trusted Trustee accounts approve
                foundations before they receive public donations.
              </p>
            </div>
            <div className="grid min-w-64 gap-3 rounded-xl border border-stone-200/50 bg-[#fbfaf7] dark:border-stone-850 dark:bg-stone-900/40 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Monthly goal</span>
                <Goal aria-hidden="true" className="size-5 text-emerald-700 dark:text-emerald-500" />
              </div>
              <p className="text-3xl font-bold tracking-tight">NGN 75,000</p>
              <div className="h-1.5 rounded-full bg-stone-200/80 dark:bg-stone-800">
                <div className="h-1.5 w-[68%] rounded-full bg-emerald-600" />
              </div>
              <p className="text-xs font-medium text-stone-550 dark:text-stone-450">
                NGN 51,000 recorded this month
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="bg-stone-950 dark:bg-stone-900/50 p-6 text-white overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Privacy mode</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">History hidden</h2>
              </div>
              <EyeOff aria-hidden="true" className="size-6 text-amber-300 status-glow" />
            </div>
            <p className="mt-5 text-sm leading-6 text-stone-300">
              Spenders can hide personal history in the dashboard while the
              platform still keeps private records for receipts, reconciliation,
              and fraud protection.
            </p>
          </div>
          <Button className="mt-6 w-full sm:w-auto" variant="secondary" type="button">
            <WalletCards aria-hidden="true" className="size-4" />
            Open giving wallet
          </Button>
        </PremiumCard>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-6 sm:px-8 xl:grid-cols-[0.8fr_1.2fr]">
        <PremiumCard className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
                Foundation review
              </p>
              <h2 className="text-2xl font-bold tracking-tight">Trustee approval flow</h2>
            </div>
            <BadgeCheck aria-hidden="true" className="size-6 text-sky-700 dark:text-sky-500" />
          </div>
          <div className="grid gap-3">
            {verificationQueue.map((item, index) => (
              <div
                className="flex items-center gap-3 rounded-xl border border-stone-200/50 dark:border-stone-850 p-3.5 transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-900/30"
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
                Live requests
              </p>
              <h2 className="text-2xl font-bold tracking-tight">
                Foundation spending needs
              </h2>
            </div>
            <Button type="button" variant="outline" size="sm">
              <Sparkles aria-hidden="true" className="size-4 text-emerald-600 dark:text-emerald-450" />
              Generate banner
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {donationRequests.map((request) => (
              <article
                className="interactive-card rounded-xl border border-stone-200/60 dark:border-stone-850 bg-white dark:bg-stone-900/30 p-4 flex flex-col justify-between"
                key={request.title}
              >
                <div>
                  <div className={`mb-4 h-1 rounded-full ${request.accent}`} />
                  <h3 className="text-base font-semibold tracking-tight leading-snug">{request.title}</h3>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    {request.foundation}
                  </p>
                </div>
                <div>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Raised</p>
                      <p className="text-lg font-bold tracking-tight tabular-nums">{request.raised}</p>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">of {request.target}</p>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className={`h-1.5 rounded-full ${request.accent}`}
                      style={{ width: request.progress }}
                    />
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Button
                      aria-label="Open QR code"
                      size="icon"
                      type="button"
                      variant="outline"
                      className="size-9 rounded-lg"
                    >
                      <QrCode aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      className="h-9 flex-1 text-xs"
                      type="button"
                      variant="secondary"
                    >
                      Donate <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </PremiumCard>
      </section>

      <section className="border-y border-stone-200/60 dark:border-stone-850 bg-white dark:bg-stone-950/50">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-8 sm:px-8 grid-cols-2 lg:grid-cols-4">
          <Metric icon={Building2} label="Verified foundations" value="24" />
          <Metric icon={FileCheck2} label="Pending Trustee reviews" value="7" />
          <Metric icon={Bell} label="Monthly reminders queued" value="183" />
          <Metric icon={QrCode} label="Generated request banners" value="56" />
        </div>
      </section>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="bg-[#fbfaf6] dark:bg-stone-900/20 border-stone-200/40 p-4 transition-all hover:border-stone-200/80">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold tracking-wider text-stone-500 uppercase dark:text-stone-400">{label}</p>
        <Icon aria-hidden={true} className="size-5 text-emerald-700 dark:text-emerald-500" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
    </Card>
  );
}
