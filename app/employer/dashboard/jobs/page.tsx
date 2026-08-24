// app/employer/dashboard/jobs/page.tsx

"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CirclePlus, Search, FileText, Calendar, 
  DollarSign, Clock, Ship, Briefcase, 
  Users, CheckCircle2, XCircle, Anchor
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import api from "../../../lib/api";

const STATUS_LABELS: Record<string, string> = {
  active: "Live",
  closed: "Closed",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-[#0E8B61]/10 text-[#0E8B61] border border-[#0E8B61]/20",
  closed: "bg-slate-100 text-slate-500 border border-slate-200",
};

const TABS = ["all", "active", "closed"];

function formatTitleCase(str: string | null | undefined): string {
  if (!str || str.toLowerCase() === 'n/a') return "Unspecified";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractArray(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  if (payload.data?.data && Array.isArray(payload.data.data)) return payload.data.data;
  if (payload.data?.items && Array.isArray(payload.data.items)) return payload.data.items;
  return [];
}

export default function JobsClient() {
  const [tab, setTab] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const [rawJobs, setRawJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/hr/jobs?limit=500");
        const jobsData = extractArray(res.data);
        setRawJobs(jobsData);
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [refreshTick]);

  const refresh = () => setRefreshTick((t) => t + 1);

  const jobs = useMemo(() => {
    return rawJobs.map((j) => {
      let status = j.job_status?.toLowerCase() === "closed" ? "closed" : "active";
      const specs = j.position_specifics || "";
      const titleMatch = specs.match(/Title:\s([^|]+)/);
      const joinMatch = specs.match(/Joining:\s([^|]+)/);
      const salMatch = specs.match(/Salary:\s([^|]+)/);

      const safeRank = j.job_rank || j.rank || j.position || "Unspecified Rank";

      return {
        id: String(j.job_id || j.id),
        status,
        postedAt: j.created_at ? new Date(j.created_at).toLocaleDateString() : "N/A",
        title: titleMatch ? titleMatch[1].trim() : formatTitleCase(safeRank),
        rank: formatTitleCase(safeRank),
        department: formatTitleCase(j.department),
        vesselType: formatTitleCase(j.vessel_type || j.ship_type),
        joiningDate: joinMatch ? joinMatch[1].trim() : "TBD", 
        salary: salMatch ? salMatch[1].trim() : "Negotiable",
        contract: j.contract || "Standard Terms",
        applicationCount: Number(j.application_count) || 0,
        newCount: Number(j.applied_count) || 0,
      };
    });
  }, [rawJobs]);

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
    .sort((a, b) => (new Date(a.postedAt) < new Date(b.postedAt) ? 1 : -1));

  const updateJobStatus = async (id: string, newStatus: "active" | "closed") => {
    try {
      setRawJobs(prev => prev.map(job => 
        String(job.job_id || job.id) === id ? { ...job, job_status: newStatus } : job
      ));
      await api.patch(`/jobs/${id}/status`, { status: newStatus });
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update job status.");
      refresh();
    }
  };

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6">
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
              {t === "all" ? "All" : STATUS_LABELS[t] || t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rank or vessel"
            className="w-full rounded-2xl border border-[#E7EAF1] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F1E35] placeholder:text-slate-400 focus:border-[#F5B61A] focus:outline-none focus:ring-4 focus:ring-[#F5B61A]/10 sm:w-72"
          />
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {isLoading && (
          <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm font-medium text-slate-400 animate-pulse">
            Syncing jobs from database...
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-[#E7EAF1] bg-white p-10 text-center text-sm text-slate-400">
            No jobs match this filter.
          </div>
        )}

        {!isLoading && filtered.map((job, i) => {
          const isClosed = job.status === 'closed';

          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
              className={`rounded-[20px] border bg-white p-5 lg:p-6 shadow-[0_1px_2px_rgba(15,30,53,0.04)] transition-all ${isClosed ? 'border-slate-200 opacity-80 bg-slate-50/50' : 'border-[#E7EAF1] hover:border-slate-300 hover:shadow-md'}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* LEFT: Job Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${STATUS_BADGE[job.status] || STATUS_BADGE["active"]}`}>
                      {isClosed ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {STATUS_LABELS[job.status] || job.status}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      <Calendar className="w-3.5 h-3.5" /> Posted {job.postedAt}
                    </span>
                  </div>
                  
                  <h3 className={`text-lg font-extrabold truncate mb-3 ${isClosed ? 'text-slate-500 line-through decoration-slate-300' : 'text-[#0F1E35]'}`}>
                    {job.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                      <Anchor className="w-3.5 h-3.5 text-slate-400" /> {job.rank}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.department}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                      <Ship className="w-3.5 h-3.5 text-slate-400" /> {job.vesselType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#F5B61A]" /> {job.contract}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" /> Joining: {job.joiningDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#0E8B61]" /> {job.salary}
                    </span>
                  </div>
                </div>

                {/* CENTER: Applicant Stats Widget */}
                <div className="flex items-center justify-center shrink-0 lg:px-6 lg:border-x lg:border-[#E7EAF1] lg:border-dashed py-2">
                  <Link 
                    href={`/employer/dashboard/jobs/${job.id}`}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all w-full sm:w-auto min-w-[140px] ${isClosed ? 'bg-slate-100 border-slate-200' : 'bg-[#F8FAFC] border-[#E7EAF1] hover:bg-blue-50 hover:border-blue-200'}`}
                  >
                    <div className="flex items-end gap-2">
                      <span className={`text-3xl font-black leading-none ${isClosed ? 'text-slate-400' : 'text-[#0F1E35]'}`}>
                        {job.applicationCount}
                      </span>
                      {job.newCount > 0 && !isClosed && (
                        <span className="flex items-center justify-center h-5 px-1.5 rounded-md bg-[#F5B61A] text-[10px] font-black text-[#0F1E35] mb-1 animate-pulse">
                          +{job.newCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">
                      Applicants
                    </span>
                  </Link>
                </div>

                {/* RIGHT: Actions */}
               {/* RIGHT: Actions */}
<div className="flex flex-row items-center gap-3 w-full lg:flex-1 lg:justify-end shrink-0 mt-4 lg:mt-0">
  <Link
    href={`/employer/dashboard/jobs/${job.id}`}
    className="flex items-center justify-center gap-2 rounded-xl bg-[#0F1E35] px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 shadow-sm"
  >
    <Users className="h-4 w-4" /> Manage
  </Link>

  {job.status === "active" ? (
    <button 
      onClick={() => {
        if (window.confirm("Are you sure you want to close this job? New candidates will no longer be able to apply.")) {
          updateJobStatus(job.id, "closed");
        }
      }} 
      className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 shadow-sm"
    >
      <XCircle className="h-4 w-4" /> Close Job
    </button>
  ) : (
    <button 
      onClick={() => updateJobStatus(job.id, "active")} 
      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 hover:text-emerald-800 shadow-sm"
    >
      <CheckCircle2 className="h-4 w-4" /> Reopen Job
    </button>
  )}
</div>

              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}