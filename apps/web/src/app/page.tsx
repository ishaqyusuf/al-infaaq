import { Badge } from "@al-infaaq/ui/badge";
import { Button } from "@al-infaaq/ui/button";
import { Card } from "@al-infaaq/ui/card";
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

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
                <ShieldCheck aria-hidden="true" className="size-4" />
                Kitaab and Sunnah aligned giving
              </div>
              <h1 className="text-3xl font-semibold leading-tight tracking-normal sm:text-5xl">
                Spend quietly. Verify carefully. Move sadaqah faster.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
                Al-Muhsinoon set private monthly goals, verified foundations
                publish real needs, and trusted Trustee accounts approve
                foundations before they receive public donations.
              </p>
            </div>
            <div className="grid min-w-64 gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">Monthly goal</span>
                <Goal aria-hidden="true" className="size-5 text-emerald-700" />
              </div>
              <p className="text-3xl font-semibold">NGN 75,000</p>
              <div className="h-2 rounded-full bg-stone-200">
                <div className="h-2 w-[68%] rounded-full bg-emerald-600" />
              </div>
              <p className="text-sm text-stone-600">
                NGN 51,000 recorded this month
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-stone-950 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-300">Privacy mode</p>
              <h2 className="mt-1 text-2xl font-semibold">History hidden</h2>
            </div>
            <EyeOff aria-hidden="true" className="size-7 text-amber-300" />
          </div>
          <p className="mt-5 text-sm leading-6 text-stone-300">
            Spenders can hide personal history in the dashboard while the
            platform still keeps private records for receipts, reconciliation,
            and fraud protection.
          </p>
          <Button className="mt-6" variant="secondary" type="button">
            <WalletCards aria-hidden="true" className="size-4" />
            Open giving wallet
          </Button>
        </Card>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-6 sm:px-8 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-stone-500">
                Foundation review
              </p>
              <h2 className="text-2xl font-semibold">Trustee approval flow</h2>
            </div>
            <BadgeCheck aria-hidden="true" className="size-6 text-sky-700" />
          </div>
          <div className="grid gap-3">
            {verificationQueue.map((item, index) => (
              <div
                className="flex items-center gap-3 rounded-lg border border-stone-200 p-3"
                key={item}
              >
                <div className="grid size-8 place-items-center rounded-md bg-sky-50 text-sm font-semibold text-sky-900">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-stone-800">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-stone-500">
                Live requests
              </p>
              <h2 className="text-2xl font-semibold">
                Foundation spending needs
              </h2>
            </div>
            <Button type="button" variant="outline">
              <Sparkles aria-hidden="true" className="size-4" />
              Generate banner
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {donationRequests.map((request) => (
              <article
                className="rounded-lg border border-stone-200 p-4"
                key={request.title}
              >
                <div className={`mb-4 h-1.5 rounded-full ${request.accent}`} />
                <h3 className="text-lg font-semibold">{request.title}</h3>
                <p className="mt-1 text-sm text-stone-600">
                  {request.foundation}
                </p>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm text-stone-500">Raised</p>
                    <p className="text-xl font-semibold">{request.raised}</p>
                  </div>
                  <p className="text-sm text-stone-500">of {request.target}</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-stone-200">
                  <div
                    className={`h-2 rounded-full ${request.accent}`}
                    style={{ width: request.progress }}
                  />
                </div>
                <div className="mt-5 flex gap-2">
                  <Button
                    aria-label="Open QR code"
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <QrCode aria-hidden="true" className="size-4" />
                  </Button>
                  <Button
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-stone-950 px-3 text-sm font-semibold text-white"
                    type="button"
                  >
                    Donate <ArrowRight aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-4">
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
    <Card className="bg-[#fbfaf6] p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-stone-600">{label}</p>
        <Icon aria-hidden={true} className="size-5 text-emerald-700" />
      </div>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
    </Card>
  );
}
