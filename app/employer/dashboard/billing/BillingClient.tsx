"use client";

import DashboardShell from "../components/DashboardShell";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  Search,
  IdCard,
  PhoneCall,
  Headset,
  type LucideIcon,
} from "lucide-react";

const PLAN_FEATURES = [
  "Unlimited job postings for one year",
  "Unlimited openings per job",
  "Applied candidate CV access included",
  "Shortlist & contact applied candidates",
  "Manage complete hiring pipeline",
  "Company profile listing",
  "Basic hiring analytics",
];

type CreditPack = { credits: number; tier?: string; price: string };

type CreditWallet = {
  title: string;
  icon: LucideIcon;
  available: number;
  packs: CreditPack[];
};

const WALLETS: CreditWallet[] = [
  {
    title: "Keyword Searches",
    icon: Search,
    available: 40,
    packs: [{ credits: 100, price: "₹2,500" }],
  },
  {
    title: "CV Unlock Credits",
    icon: IdCard,
    available: 11,
    packs: [
      { credits: 25, tier: "Starter", price: "₹2,000" },
      { credits: 100, tier: "Growth", price: "₹7,000" },
      { credits: 500, tier: "Enterprise", price: "₹30,000" },
    ],
  },
  {
    title: "Contact Unlock Credits",
    icon: PhoneCall,
    available: 5,
    packs: [
      { credits: 25, tier: "Starter", price: "₹3,000" },
      { credits: 100, tier: "Growth", price: "₹10,000" },
    ],
  },
];

const USAGE_HISTORY = [
  {
    date: "13/07/2026, 16:15:53",
    kind: "cv unlock",
    delta: -1,
    reason: "Unlock cv for candidate b9c06e6f",
  },
];

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2>
      {description && <p className="max-w-2xl text-xs leading-relaxed text-slate-500">{description}</p>}
    </div>
  );
}

export default function BillingClient() {
  return (
    <DashboardShell pageTitle="Billing & Plans">
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
          Billing
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
          Plans &amp; Smart Sourcing Wallet
        </h1>
      </div>

      {/* Yearly Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-[24px] border border-[#E7EAF1] bg-white p-7 shadow-[0_1px_2px_rgba(15,30,53,0.04)] sm:p-8"
      >
        <div className="absolute -right-6 -top-6 flex h-28 w-28 items-center justify-center rounded-full bg-[#F5B61A]/10">
          <BadgeCheck className="h-10 w-10 text-[#F5B61A]" strokeWidth={1.5} />
        </div>

        <div className="relative z-10 max-w-2xl">
          <h3 className="text-xl font-extrabold tracking-tight text-[#0F1E35] sm:text-2xl">
            Yearly Job Posting Plan
          </h3>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-[#0F1E35]">₹25,000</span>
            <span className="text-sm font-medium text-slate-400">/ year</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Best for companies who want regular maritime job posting throughout the year.
            Applied candidate CV access is included.
          </p>

          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0E8B61]" strokeWidth={2.5} />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0E8B61]/10 px-3 py-1.5 text-xs font-bold text-[#0E8B61]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0E8B61]" />
              Plan Active
            </span>
            <span className="rounded-full border border-[#E7EAF1] px-3 py-1.5 text-xs font-semibold text-slate-500">
              Valid till 13/07/2027
            </span>
          </div>
        </div>
      </motion.div>

      {/* Smart Sourcing Wallet */}
      <div className="space-y-4">
        <SectionHeading
          title="Smart Sourcing Wallet"
          description="Job applications are included in your yearly plan. Smart Sourcing is charged separately when you search or unlock candidates who have not applied to your jobs."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {WALLETS.map((wallet, i) => {
            const Icon = wallet.icon;
            return (
              <motion.div
                key={wallet.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className="rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-[0_1px_2px_rgba(15,30,53,0.04)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F1E35]/5 text-[#0F1E35]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <p className="mt-3 text-sm font-bold text-[#0F1E35]">{wallet.title}</p>
                <p className="mt-1">
                  <span className="text-2xl font-extrabold text-[#0F1E35]">{wallet.available}</span>
                  <span className="ml-1.5 text-xs font-medium text-slate-400">credits available</span>
                </p>

                <div className="mt-4 space-y-2 border-t border-[#E7EAF1] pt-4">
                  {wallet.packs.map((pack) => (
                    <div
                      key={`${pack.credits}-${pack.tier ?? "base"}`}
                      className="flex items-center justify-between gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2.5"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#0F1E35]">
                          {pack.credits} credits
                          {pack.tier && <span className="font-medium text-slate-400"> · {pack.tier}</span>}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">{pack.price}</p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-lg bg-[#F5B61A] px-3 py-1.5 text-[11px] font-bold text-[#0F1E35] transition-all hover:brightness-95 active:scale-[0.98]"
                      >
                        Buy pack
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Custom plan */}
        <motion.div
          whileHover={{ y: -2 }}
          className="flex flex-col items-start justify-between gap-4 rounded-[20px] bg-linear-to-br from-[#0F1E35] to-[#16294A] p-6 text-white sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Headset className="h-5 w-5 text-[#F5B61A]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-bold">Custom Smart Sourcing Plan</p>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-300">
                Bulk CV access, custom credit packs and dedicated hiring support. Smart
                Sourcing pricing can be customized based on company hiring needs.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-xl bg-[#F5B61A] px-4 py-2.5 text-xs font-bold text-[#0F1E35] transition-all hover:brightness-95 active:scale-[0.98]"
          >
            Contact Sales
          </button>
        </motion.div>
      </div>

      {/* Usage history */}
      <div className="space-y-4">
        <SectionHeading title="Usage History" />
        <div className="overflow-x-auto rounded-[20px] border border-[#E7EAF1] bg-white shadow-[0_1px_2px_rgba(15,30,53,0.04)]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E7EAF1] text-xs font-bold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-bold">Date</th>
                <th className="px-5 py-3 font-bold">Kind</th>
                <th className="px-5 py-3 font-bold">Delta</th>
                <th className="px-5 py-3 font-bold">Reason</th>
              </tr>
            </thead>
            <tbody>
              {USAGE_HISTORY.map((row) => (
                <tr key={row.date} className="border-b border-[#E7EAF1] last:border-0">
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{row.date}</td>
                  <td className="px-5 py-3.5 text-slate-700">{row.kind}</td>
                  <td className="px-5 py-3.5 font-bold text-red-500">{row.delta}</td>
                  <td className="px-5 py-3.5 text-slate-500">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
