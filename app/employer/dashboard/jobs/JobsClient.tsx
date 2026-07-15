"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CirclePlus, Search, FileText } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { useAuth } from "../../../context/auth-context";
import {
  getEmployerJobs,
  pauseJob,
  reopenJob,
  closeJob,
  publishDraftJob,
  type StoredJob,
  type JobStatus,
} from "../../../lib/jobs-store";
import { countApplicationsForJob, countNewForJob } from "../../../lib/applications-store";
import { getCompanyProfile } from "../../../lib/company-profile-store";

const STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  pending: "Pending Approval",
  live: "Live",
  paused: "Paused",
  closed: "Closed",
  rejected: "Rejected",
};

const STATUS_BADGE: Record<JobStatus, string> = {
  draft: "bg-slate-100 text-slate-500",
  pending: "bg-[#F5B61A]/15 text-[#946200]",
  live: "bg-[#0E8B61]/10 text-[#0E8B61]",
  paused: "bg-orange-50 text-orange-600",
  closed: "bg-slate-100 text-slate-400",
  rejected: "bg-red-50 text-red-600",
};

const TABS: ("all" | JobStatus)[] = ["all", "draft", "pending", "live", "paused", "closed"];

export default function JobsClient() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<StoredJob[]>([]);
  const [tab, setTab] = useState<"all" | JobStatus>("all");
  const [query, setQuery] = useState("");

  function refresh() {
    if (!user) return;
    setJobs(getEmployerJobs(user.email));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const isVerified = useMemo(
    () => (user ? Boolean(getCompanyProfile(user.email).verified) : false),
    [user]
  );

  const filtered = jobs
    .filter((j) => tab === "all" || j.status === tab)
    .filter((j) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.rank.toLowerCase().includes(q) ||
        j.vesselType.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));

  function handleAction(action: (id: string) => void, id: string) {
    action(id);
    refresh();
  }

  return (
    <DashboardShell pageTitle="Manage Jobs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-widest text-[#0F1E35] uppercase block">
            Manage Jobs
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1E35] sm:text-3xl">
            Manage Maritime Jobs
          </h1>
        </div>
        <Link
          href="/employer/dashboard/post-job"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#F5B61A] px-4 py-2.5 text-xs font-bold text-[#0F1E35] shadow-sm shadow-[#F5B61A]/30 transition-all hover:brightness-95 active:scale-[0.98]"
        >
          <CirclePlus className="h-4 w-4" strokeWidth={2} />
          Post New Job
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[#E7EAF1] bg-white p-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                tab === t ? "bg-[#0F1E35] text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {t === "all" ? "All" : STATUS_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search job title / rank / vessel"
            className="w-full rounded-2xl border border-[#E7EAF1] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F1E35] placeholder:text-slate-400 focus:border-[#F5B61A] focus:outline-none focus:ring-4 focus:ring-[#F5B61A]/10 sm:w-72"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm text-slate-400">
            No jobs match this filter.
          </div>
        )}

        {filtered.map((job, i) => {
          const applications = countApplicationsForJob(job.id);
          const newCount = countNewForJob(job.id);
          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
              className="rounded-[20px] border border-[#E7EAF1] bg-white p-5 shadow-[0_1px_2px_rgba(15,30,53,0.04)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_BADGE[job.status]}`}
                    >
                      {STATUS_LABELS[job.status]}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Posted {job.postedAt}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold text-[#0F1E35]">{job.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {job.rank} · {job.department} · {job.vesselType} · Joining{" "}
                    {job.joiningDate || "TBD"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#0E8B61]">{job.salary}</p>
                </div>

                <div className="flex shrink-0 items-center gap-5">
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-[#0F1E35]">{applications}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Applications
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-[#0F1E35]">{newCount}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      New
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E7EAF1] pt-4">
                <Link
                  href={`/employer/dashboard/jobs/${job.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-[#0F1E35] transition-colors hover:bg-slate-200"
                >
                  <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                  View Applications
                </Link>

                {job.status === "live" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAction(pauseJob, job.id)}
                      className="rounded-xl border border-[#E7EAF1] px-3.5 py-2 text-xs font-bold text-[#0F1E35] transition-colors hover:bg-slate-50"
                    >
                      Pause
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(closeJob, job.id)}
                      className="rounded-xl border border-[#E7EAF1] px-3.5 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </>
                )}
                {job.status === "paused" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAction(reopenJob, job.id)}
                      className="rounded-xl border border-[#E7EAF1] px-3.5 py-2 text-xs font-bold text-[#0F1E35] transition-colors hover:bg-slate-50"
                    >
                      Reopen
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(closeJob, job.id)}
                      className="rounded-xl border border-[#E7EAF1] px-3.5 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </>
                )}
                {job.status === "draft" && (
                  <button
                    type="button"
                    onClick={() => handleAction((id) => publishDraftJob(id, isVerified), job.id)}
                    className="rounded-xl bg-[#F5B61A] px-3.5 py-2 text-xs font-bold text-[#0F1E35] transition-all hover:brightness-95"
                  >
                    Publish
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
