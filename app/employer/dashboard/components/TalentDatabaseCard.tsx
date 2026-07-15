"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CountUp from "./CountUp";

const MINI_STATS = [
  { label: "Ratings Today", value: 0 },
  { label: "Engineers Today", value: 0 },
  { label: "Deck Officers", value: 0 },
];

export default function TalentDatabaseCard() {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-[24px] bg-linear-to-br from-[#0F1E35] to-[#16294A] p-7 text-white sm:p-8"
    >
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-56 w-56 rounded-full bg-[#F5B61A]/10 blur-[100px]" />

      <div className="relative z-10">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Find Seafarers Faster with Maritime Talent Database
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
          Search verified Ratings, Deck Officers, Engine Officers, ETO, Catering Crew, and
          Masters using advanced filters.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {MINI_STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
            >
              <p className="text-xl font-extrabold text-[#F5B61A]">
                <CountUp value={s.value} />
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        <Link
          href="/employer/dashboard/talent"
          className="mt-6 inline-flex rounded-2xl bg-[#F5B61A] px-5 py-3 text-sm font-bold text-[#0F1E35] shadow-lg shadow-[#F5B61A]/20 transition-all hover:brightness-95 active:scale-[0.98]"
        >
          Open Maritime Talent Database
        </Link>
      </div>
    </motion.div>
  );
}
