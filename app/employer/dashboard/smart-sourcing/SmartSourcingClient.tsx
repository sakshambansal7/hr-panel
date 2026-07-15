"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Search, Lock, LockOpen } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { TALENT_CANDIDATES, type TalentCategory } from "../../../lib/talent-database";

type Filters = {
  category: TalentCategory | "";
  rank: string;
  vessel: string;
  availability: string;
};

const EMPTY_FILTERS: Filters = { category: "", rank: "", vessel: "", availability: "" };

export default function SmartSourcingClient() {
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters | null>(null);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

  const ranks = useMemo(() => Array.from(new Set(TALENT_CANDIDATES.map((c) => c.rank))), []);
  const vessels = useMemo(() => Array.from(new Set(TALENT_CANDIDATES.map((c) => c.vesselType))), []);
  const availabilities = useMemo(
    () => Array.from(new Set(TALENT_CANDIDATES.map((c) => c.availability))),
    []
  );

  const results = useMemo(() => {
    if (!applied) return [];
    return TALENT_CANDIDATES.filter((c) => {
      if (applied.category && c.category !== applied.category) return false;
      if (applied.rank && c.rank !== applied.rank) return false;
      if (applied.vessel && c.vesselType !== applied.vessel) return false;
      if (applied.availability && c.availability !== applied.availability) return false;
      return true;
    });
  }, [applied]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setApplied(draft);
  }

  return (
    <DashboardShell pageTitle="Smart Sourcing">
      <div className="rounded-[24px] bg-linear-to-br from-[#0F1E35] to-[#16294A] p-7 text-white sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#F5B61A]">
          <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          Smart Sourcing · Paid Add-on
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Discover and Connect with Matching Seafarers
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          Your yearly plan includes CVs of candidates who apply to your jobs. To discover and
          unlock candidates from the full Maritime Talent Database, use Smart Sourcing credits.
        </p>
        <Link
          href="/employer/dashboard/billing"
          className="mt-5 inline-flex rounded-2xl bg-[#F5B61A] px-5 py-3 text-sm font-bold text-[#0F1E35] shadow-lg shadow-[#F5B61A]/20 transition-all hover:brightness-95 active:scale-[0.98]"
        >
          Buy Smart Sourcing Credits
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded-2xl border border-[#E7EAF1] bg-white p-4 sm:flex-row sm:items-center"
      >
        <select
          value={draft.category}
          onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as TalentCategory | "" }))}
          className="rounded-xl border border-[#E7EAF1] bg-white py-2.5 px-3 text-sm text-[#0F1E35] focus:border-[#F5B61A] focus:outline-none focus:ring-4 focus:ring-[#F5B61A]/10"
        >
          <option value="">Any category</option>
          <option value="Rating">Rating</option>
          <option value="Engineer">Engineer</option>
          <option value="Deck Officer">Deck Officer</option>
        </select>
        <select
          value={draft.rank}
          onChange={(e) => setDraft((d) => ({ ...d, rank: e.target.value }))}
          className="rounded-xl border border-[#E7EAF1] bg-white py-2.5 px-3 text-sm text-[#0F1E35] focus:border-[#F5B61A] focus:outline-none focus:ring-4 focus:ring-[#F5B61A]/10"
        >
          <option value="">Any rank</option>
          {ranks.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={draft.vessel}
          onChange={(e) => setDraft((d) => ({ ...d, vessel: e.target.value }))}
          className="rounded-xl border border-[#E7EAF1] bg-white py-2.5 px-3 text-sm text-[#0F1E35] focus:border-[#F5B61A] focus:outline-none focus:ring-4 focus:ring-[#F5B61A]/10"
        >
          <option value="">Any vessel</option>
          {vessels.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={draft.availability}
          onChange={(e) => setDraft((d) => ({ ...d, availability: e.target.value }))}
          className="rounded-xl border border-[#E7EAF1] bg-white py-2.5 px-3 text-sm text-[#0F1E35] focus:border-[#F5B61A] focus:outline-none focus:ring-4 focus:ring-[#F5B61A]/10"
        >
          <option value="">Any availability</option>
          {availabilities.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F1E35] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#16294A] sm:ml-auto"
        >
          <Search className="h-4 w-4" strokeWidth={2} />
          Search
        </button>
      </form>

      {applied === null && (
        <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm text-slate-400">
          Set your filters and search to discover matching seafarers.
        </div>
      )}

      {applied !== null && results.length === 0 && (
        <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm text-slate-400">
          No candidates match these filters.
        </div>
      )}

      {results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((c, i) => {
            const isUnlocked = unlocked.has(c.id);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                whileHover={{ y: -3 }}
                className="rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-[0_1px_2px_rgba(15,30,53,0.04)]"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      isUnlocked ? "bg-[#0E8B61]/10 text-[#0E8B61]" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isUnlocked ? <LockOpen className="h-3 w-3" strokeWidth={2.5} /> : <Lock className="h-3 w-3" strokeWidth={2.5} />}
                    {isUnlocked ? "Unlocked" : "Locked"}
                  </span>
                  <span className="text-xs font-bold text-[#0E8B61]">{c.profileMatchPercent}%</span>
                </div>
                <p className="mt-3 text-base font-extrabold text-[#0F1E35]">{c.maskedName}</p>
                <p className="text-xs text-slate-500">
                  {c.rank} · {c.category} · {c.vesselType}
                </p>
                <p className="mt-1 text-xs text-slate-400">{c.availability}</p>
                <button
                  type="button"
                  disabled={isUnlocked}
                  onClick={() => setUnlocked((prev) => new Set(prev).add(c.id))}
                  className="mt-4 w-full rounded-xl bg-[#F5B61A] py-2.5 text-xs font-bold text-[#0F1E35] transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-default disabled:bg-[#0E8B61]/10 disabled:text-[#0E8B61]"
                >
                  {isUnlocked ? "CV Unlocked" : "Unlock CV (1 credit)"}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
