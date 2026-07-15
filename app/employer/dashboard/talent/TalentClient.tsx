"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Search, Lock, LockOpen, Users, Wrench, ShipWheel } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { TALENT_CANDIDATES, categoryCounts, type TalentCategory } from "../../../lib/talent-database";

const CATEGORY_ICON: Record<TalentCategory, typeof Users> = {
  Rating: Users,
  Engineer: Wrench,
  "Deck Officer": ShipWheel,
};

function experienceLabel(months: number) {
  if (months === 0) return "0mo";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return years > 0 ? `${years}y ${rem}mo` : `${rem}mo`;
}

function downloadCsv(rows: typeof TALENT_CANDIDATES) {
  const header = ["Rank", "Category", "Vessel Type", "Availability", "Experience (mo)", "Profile Match %"];
  const lines = rows.map((c) =>
    [c.rank, c.category, c.vesselType, c.availability, c.experienceMonths, c.profileMatchPercent].join(",")
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "maritime-talent-database.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function TalentClient() {
  const [category, setCategory] = useState<TalentCategory | "All">("All");
  const [rankFilter, setRankFilter] = useState("");
  const [vesselFilter, setVesselFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [query, setQuery] = useState("");
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

  const counts = categoryCounts();
  const ranks = useMemo(() => Array.from(new Set(TALENT_CANDIDATES.map((c) => c.rank))), []);
  const vessels = useMemo(() => Array.from(new Set(TALENT_CANDIDATES.map((c) => c.vesselType))), []);
  const availabilities = useMemo(
    () => Array.from(new Set(TALENT_CANDIDATES.map((c) => c.availability))),
    []
  );

  const filtered = TALENT_CANDIDATES.filter((c) => {
    if (category !== "All" && c.category !== category) return false;
    if (rankFilter && c.rank !== rankFilter) return false;
    if (vesselFilter && c.vesselType !== vesselFilter) return false;
    if (availabilityFilter && c.availability !== availabilityFilter) return false;
    const q = query.trim().toLowerCase();
    if (q && !`${c.rank} ${c.vesselType}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <DashboardShell pageTitle="Maritime Talent">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
            Category-wise CV Database
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
            Maritime Talent Database
          </h1>
          <p className="text-sm text-slate-500">
            Discover Ratings, Engineers &amp; Deck Officers separately with premium filters.
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(filtered)}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-[#E7EAF1] bg-white px-4 py-2.5 text-xs font-bold text-[#0F1E35] transition-colors hover:bg-slate-50"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          Export Filtered CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total CVs today", value: 0 },
          { label: "Ratings today", value: 0 },
          { label: "Engineers today", value: 0 },
          { label: "Deck today", value: 0 },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-[0_1px_2px_rgba(15,30,53,0.04)]"
          >
            <p className="text-2xl font-extrabold text-[#0F1E35]">{s.value}</p>
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", "Rating", "Engineer", "Deck Officer"] as const).map((c) => {
          const Icon = c === "All" ? Users : CATEGORY_ICON[c];
          const count = c === "All" ? TALENT_CANDIDATES.length : counts[c];
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
                category === c
                  ? "border-[#0F1E35] bg-[#0F1E35] text-white"
                  : "border-[#E7EAF1] bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {c === "All" ? "All" : c === "Deck Officer" ? "Deck Officers" : `${c}s`} · {count}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E7EAF1] bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by rank, vessel…"
            className="w-full rounded-xl border border-[#E7EAF1] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F1E35] placeholder:text-slate-400 focus:border-[#F5B61A] focus:outline-none focus:ring-4 focus:ring-[#F5B61A]/10"
          />
        </div>
        <select
          value={rankFilter}
          onChange={(e) => setRankFilter(e.target.value)}
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
          value={vesselFilter}
          onChange={(e) => setVesselFilter(e.target.value)}
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
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="rounded-xl border border-[#E7EAF1] bg-white py-2.5 px-3 text-sm text-[#0F1E35] focus:border-[#F5B61A] focus:outline-none focus:ring-4 focus:ring-[#F5B61A]/10"
        >
          <option value="">Any availability</option>
          {availabilities.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => {
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
                {c.rank} · {c.category}
              </p>

              <div className="mt-3 space-y-1 text-xs text-slate-500">
                <p>Vessel: {c.vesselType}</p>
                <p>Availability: {c.availability}</p>
                <p>Experience: {experienceLabel(c.experienceMonths)}</p>
              </div>

              <div className="mt-4 border-t border-[#E7EAF1] pt-4">
                <button
                  type="button"
                  disabled={isUnlocked}
                  onClick={() => setUnlocked((prev) => new Set(prev).add(c.id))}
                  className="w-full rounded-xl bg-[#F5B61A] py-2.5 text-xs font-bold text-[#0F1E35] transition-all hover:brightness-95 active:scale-[0.98] disabled:cursor-default disabled:bg-[#0E8B61]/10 disabled:text-[#0E8B61]"
                >
                  {isUnlocked ? "CV Unlocked" : "Unlock CV (1 credit)"}
                </button>
                <p className="mt-1.5 text-center text-[10px] font-medium text-slate-400">
                  Requires Smart Sourcing Credit
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
