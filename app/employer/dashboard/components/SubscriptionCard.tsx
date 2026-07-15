"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Check } from "lucide-react";

const FEATURES = [
  "Unlimited active jobs.",
  "Unlimited candidate views.",
  "AI Smart Matching.",
  "Priority Support.",
];

export default function SubscriptionCard() {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-[24px] bg-linear-to-br from-[#0E8B61] to-[#0B7050] p-7 text-white shadow-[0_12px_28px_rgba(14,139,97,0.25)] sm:p-8"
    >
      <div className="absolute -right-8 -top-8 flex h-32 w-32 items-center justify-center rounded-full bg-white/5">
        <ShieldCheck className="h-12 w-12 text-[#F5B61A]" strokeWidth={1.5} />
      </div>

      <div className="relative z-10 max-w-lg">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Premium Job Posting Plan Active
        </h2>
        <ul className="mt-4 space-y-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-emerald-50">
              <Check className="h-4 w-4 shrink-0 text-[#F5B61A]" strokeWidth={2.5} />
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-emerald-100/80">
          Valid till 13 July 2027
        </p>

        <Link
          href="/employer/dashboard/billing"
          className="mt-6 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#0E8B61] shadow-md transition-transform active:scale-[0.98] hover:brightness-95"
        >
          Manage Plan
        </Link>
      </div>
    </motion.div>
  );
}
